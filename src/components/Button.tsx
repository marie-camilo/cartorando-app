import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    variant?: 'green' | 'orange' | 'lavender'
}

export default function Button({ children, variant = 'green', type = 'button', ...props }: ButtonProps) {
    const baseClasses = "flex items-center justify-center text-white text-sm font-medium py-2 px-4 rounded-2xl transition-colors duration-200 cursor-pointer"
    const colorClasses = variant === 'green'
      ? "bg-[var(--green-moss)] hover:bg-[#766c3d]"
      : variant === 'orange'
        ? "bg-[var(--corail)] hover:bg-[var(--orange)]"
        : "bg-[var(--lavender)] hover:bg-[var(--orange)]"
    return (
      <button type={type} {...props} className={`${baseClasses} ${colorClasses}`}>
              {children}
      </button>
    )
}

