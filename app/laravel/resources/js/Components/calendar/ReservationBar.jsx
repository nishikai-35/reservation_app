export default function ReservationBar({
    reservation,
    width,
    left,
    color,
    onClick,
}) {

    console.log(width);
    return (
        <div
            onClick={onClick}
            className={`
                absolute
                top-4
                h-10    
                rounded-lg
                px-3
                flex
                items-center
                shadow
                cursor-pointer
                text-xs
                font-semibold
                whitespace-nowrap
                overflow-hidden
                ${color}
            `}
            style={{
                left:`${left}px`,
                width:`${width}px`,
                zIndex:20,
            }}
        >

            <span className="truncate">
                {reservation.guest_name}
            </span>

        </div>
    );
}