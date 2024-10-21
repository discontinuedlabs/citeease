export default function Logo() {
    return (
        <div className="text-neutral-black relative h-min w-fit select-none">
            <div className="inline font-cambo text-3xl" style={{ marginTrim: "block" }}>
                C<small>ITE</small>
                <span className="bg-primary-200 relative">
                    <div className="bg-primary-500 absolute start-0 top-0 h-full w-0.5">
                        <div className="bg-primary-500 absolute start-1/2 h-3 w-3 -translate-x-1/2 -translate-y-full rounded-full" />
                    </div>
                    E<small>ASE</small>
                    <div className="bg-primary-500 absolute start-full top-0 h-full w-0.5">
                        <div className="bg-primary-500 absolute bottom-0 start-1/2 h-3 w-3 -translate-x-1/2 translate-y-full rounded-full" />
                    </div>
                </span>
                <sup className="font-sans text-xs font-bold"> EXPERIMENT</sup>
            </div>
        </div>
    );
}
