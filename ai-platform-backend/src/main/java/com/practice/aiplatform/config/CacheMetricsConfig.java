package com.practice.aiplatform.config;

import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.Nullable;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class CacheMetricsConfig {

    @Bean
    public BeanPostProcessor meteredCacheManagerBeanPostProcessor(MeterRegistry meterRegistry) {
        return new BeanPostProcessor() {
            @Override
            public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
                if (!(bean instanceof CacheManager cacheManager)) {
                    return bean;
                }
                return new MeteredCacheManager(cacheManager, meterRegistry);
            }
        };
    }

    private static final class MeteredCacheManager implements CacheManager {
        private final CacheManager delegate;
        private final MeterRegistry meterRegistry;
        private final Map<String, Cache> wrappedCaches = new ConcurrentHashMap<>();

        private MeteredCacheManager(CacheManager delegate, MeterRegistry meterRegistry) {
            this.delegate = delegate;
            this.meterRegistry = meterRegistry;
        }

        @Override
        @Nullable
        public Cache getCache(String name) {
            Cache cache = delegate.getCache(name);
            if (cache == null) {
                return null;
            }
            return wrappedCaches.computeIfAbsent(name, key -> new MeteredCache(cache, meterRegistry, key));
        }

        @Override
        public Collection<String> getCacheNames() {
            return delegate.getCacheNames();
        }
    }

    private static final class MeteredCache implements Cache {
        private final Cache delegate;
        private final MeterRegistry meterRegistry;
        private final String cacheName;

        private MeteredCache(Cache delegate, MeterRegistry meterRegistry, String cacheName) {
            this.delegate = delegate;
            this.meterRegistry = meterRegistry;
            this.cacheName = cacheName;
        }

        @Override
        public String getName() {
            return delegate.getName();
        }

        @Override
        public Object getNativeCache() {
            return delegate.getNativeCache();
        }

        @Override
        @Nullable
        public ValueWrapper get(Object key) {
            try {
                ValueWrapper value = delegate.get(key);
                record(value != null ? "hit" : "miss");
                return value;
            } catch (RuntimeException ex) {
                record("error");
                throw ex;
            }
        }

        @Override
        @Nullable
        public <T> T get(Object key, @Nullable Class<T> type) {
            try {
                T value = delegate.get(key, type);
                record(value != null ? "hit" : "miss");
                return value;
            } catch (RuntimeException ex) {
                record("error");
                throw ex;
            }
        }

        @Override
        @Nullable
        @SuppressWarnings("unchecked")
        public <T> T get(Object key, Callable<T> valueLoader) {
            try {
                ValueWrapper existing = delegate.get(key);
                if (existing != null) {
                    record("hit");
                    return (T) existing.get();
                }
                record("miss");
                return delegate.get(key, valueLoader);
            } catch (RuntimeException ex) {
                record("error");
                throw ex;
            }
        }

        @Override
        public void put(Object key, @Nullable Object value) {
            delegate.put(key, value);
        }

        @Override
        @Nullable
        public ValueWrapper putIfAbsent(Object key, @Nullable Object value) {
            return delegate.putIfAbsent(key, value);
        }

        @Override
        public void evict(Object key) {
            delegate.evict(key);
        }

        @Override
        public void clear() {
            delegate.clear();
        }

        private void record(String result) {
            meterRegistry.counter(
                    "cache_layer_access_total",
                    "cache", cacheName,
                    "layer", "l2",
                    "result", result
            ).increment();
        }
    }
}
