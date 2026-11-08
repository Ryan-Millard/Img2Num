import clsx from "clsx";
import styles from "./BackgroundBand.module.css";

export default function BackgroundBand({ as: Tag = "section", rows, className, innerWrapper = {}, children, ...rest }) {
  const { className: innerClassName, ...innerRest } = innerWrapper;

  const parentClassName = clsx(styles.parent, className);
  const innerWrapperClassName = clsx(styles.inner, innerClassName);

  return (
    <Tag className={parentClassName} {...rest}>
      <div className={innerWrapperClassName} {...innerRest}>
        {children}
      </div>
    </Tag>
  );
}

