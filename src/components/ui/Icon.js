export default function Icon({ name, className, children, ...rest }) {
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <i className={`material-icons-round h-full align-middle ${className}`} {...rest}>
            {name || children}
        </i>
    );
}
