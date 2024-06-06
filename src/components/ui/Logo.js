export default function Logo() {
    return (
        <div className="relative h-min w-fit">
            <div className="text-3xl font-cambo text-neutral-black inline" style={{ marginTrim: "block" }}>
                C<small>ITE</small>
                <span className="relative bg-primary-200">
                    <div className="absolute bg-primary-500 w-0.5 h-full top-0 start-0">
                        <div className="absolute start-1/2 rounded-full w-3 h-3 bg-primary-500 -translate-x-1/2 -translate-y-full"></div>
                    </div>
                    E<small>ASE</small>
                    <div className="absolute bg-primary-500 w-0.5 h-full top-0 start-full">
                        <div className="absolute start-1/2 rounded-full bottom-0 w-3 h-3 bg-primary-500 -translate-x-1/2 translate-y-full"></div>
                    </div>
                </span>
            </div>
        </div>
    );
}
