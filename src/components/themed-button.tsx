import React from "react";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "outline";

interface ThemedButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  // Định nghĩa classes cho từng variant
  const variantClasses = {
    primary: "bg-primary-light dark:bg-primary-dark",
    secondary: "bg-secondary-light dark:bg-secondary-dark",
    success: "bg-green-500",
    warning: "bg-orange-500",
    error: "bg-red-500",
    outline:
      "bg-transparent border-2 border-primary-light dark:border-primary-dark",
  };

  // Định nghĩa classes cho size
  const sizeClasses = {
    small: "px-3 py-2",
    medium: "px-4 py-3",
    large: "px-6 py-4",
  };

  // Định nghĩa text size
  const textSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  // Text color dựa trên variant
  const textColorClass =
    variant === "outline"
      ? "text-primary-light dark:text-primary-dark"
      : "text-white";

  return (
    <TouchableOpacity
      className={`
        rounded-lg items-center justify-center
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${disabled ? "opacity-50" : ""}
        ${className || ""}
      `.trim()}
      disabled={disabled}
      {...props}
    >
      <Text
        className={`font-semibold ${textSizeClasses[size]} ${textColorClass}`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};
