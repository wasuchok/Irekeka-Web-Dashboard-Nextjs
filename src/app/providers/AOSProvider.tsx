"use client";

import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

interface Props {
    children: React.ReactNode;
}

export default function AOSProvider({ children }: Props) {
    useEffect(() => {
        AOS.init({
            duration: 600,
            easing: "ease-out-quart",
            once: true,
        });
        AOS.refresh();
    }, []);

    return <>{children}</>;
}
