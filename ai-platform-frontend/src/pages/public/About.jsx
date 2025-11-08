import React from "react";
import {
  Card,
  CardBody,
  Avatar,
  Typography,
  Button,
} from "@material-tailwind/react";

// GitHub Icon
const GithubIcon = (props) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

// LinkedIn Icon
const LinkedInIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.557V9H7.12v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
  </svg>
);

export function About() {
  return (
    <div className="bg-white dark:bg-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card color="transparent" shadow={false}>
          <CardBody className="text-center">
            {/* --- 👇 THIS IS THE CHANGE --- 👇 */}
            <Avatar
              src="https://avatars.githubusercontent.com/u/176177158?v=4"
              alt="Subarta Ghosh"
              // Removed size="xxxl" and added custom classes
              className="mb-6 shadow-lg w-48 h-48 mx-auto" // w-48 h-48 is 192px
            />
            {/* --- 👆 END OF CHANGE --- 👆 */}

            <Typography variant="h2" color="blue-gray" className="mb-2 dark:text-gray-100">
              Subarta Ghosh
            </Typography>

            <Typography variant="h6" color="blue" className="font-medium">
              Computer Science Student
            </Typography>
            <Typography variant="h6" color="blue" className="font-medium mb-4">
              Vellore Institute of Technology (Vellore Campus)
            </Typography>

            <div className="max-w-2xl mx-auto">
              <Typography color="blue-gray" className="font-normal dark:text-gray-300 mb-4 text-base">
                I am a passionate computer science student with a strong interest in
                full-stack development and artificial intelligence.
              </Typography>
              <Typography color="blue-gray" className="font-normal dark:text-gray-300 mb-4 text-base">
                This platform is a personal project built to apply my skills in Java, Spring Boot, and React,
                while also exploring the power of generative AI to create practical learning tools.
              </Typography>
            </div>

            <div className="mt-8 flex justify-center gap-6">
              <a href="https://www.linkedin.com/in/subhh/" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="gradient"
                  color="blue"
                  className="flex items-center gap-2"
                >
                  <LinkedInIcon className="w-5 h-5" />
                  LinkedIn
                </Button>
              </a>
              <a href="https://github.com/subh-ghosh" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="gradient"
                  color="gray"
                  className="flex items-center gap-2"
                >
                  <GithubIcon className="w-5 h-5" />
                  GitHub
                </Button>
              </a>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default About;