export default function Logo() {
    return (
        <div className="relative h-min w-fit select-none text-neutral-black">
            <div className="inline font-cambo text-3xl" style={{ marginTrim: "block" }}>
                C<small>ITE</small>
                <span className="relative bg-primary-200">
                    <div className="absolute start-0 top-0 h-full w-0.5 bg-primary-500">
                        <div className="absolute start-1/2 h-3 w-3 -translate-x-1/2 -translate-y-full rounded-full bg-primary-500" />
                    </div>
                    E<small>ASE</small>
                    <div className="absolute start-full top-0 h-full w-0.5 bg-primary-500">
                        <div className="absolute bottom-0 start-1/2 h-3 w-3 -translate-x-1/2 translate-y-full rounded-full bg-primary-500" />
                    </div>
                </span>
                <sup className="font-sans text-sm font-bold"> EXPERIMENTAL</sup>
            </div>
        </div>
    );
}
