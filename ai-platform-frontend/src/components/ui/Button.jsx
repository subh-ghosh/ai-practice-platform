export function Button({ variant = "primary", className = "", ...props }) {
  const base = "btn-base";
  const map = {
    primary: "btn-primary",
    outline: "btn-outline",
    ghost: "btn-ghost",
  };
  return <button className={`${base} ${map[variant]} ${className}`} {...props} />;
}
