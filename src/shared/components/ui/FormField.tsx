import type { ChangeEvent, InputHTMLAttributes } from "react";

interface FormFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  id: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  containerClassName?: string;
}

export function FormField({
  label,
  id,
  value,
  onChange,
  containerClassName = "login-input-group",
  className = "",
  ...rest
}: FormFieldProps) {
  return (
    <div className={containerClassName}>
      <label htmlFor={id}>{label}</label>

      <input
        id={id}
        value={value}
        onChange={onChange}
        className={className}
        {...rest}
      />
    </div>
  );
}
