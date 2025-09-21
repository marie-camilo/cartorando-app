import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    variant?: 'green' | 'orange' | 'lavender'
}

export default function Button({children, variant = 'green', ...props}: ButtonProps) {
    const baseClasses = "flex items-center justify-center text-white font-semibold py-2 px-4 rounded-xl transition-colors duration-200 cursor-pointer"
    const colorClasses = variant === 'green'
        ? "bg-[var(--green-moss)] hover:bg-[#766c3d]"
        : variant === 'orange'
            ? "bg-[var(--corail)] hover:bg-[var(--orange)]"
            : "bg-[var(--lavender)] hover:bg-[var(--orange)]"
    return (
        <button {...props} className={`${baseClasses} ${colorClasses}`}>
            {children}
        </button>
    )
}
