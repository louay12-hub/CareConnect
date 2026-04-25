import React, { useRef, useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { apiURL } from "../apiURL.JSX";
import Navbar from "./Navbar";

const Dr = () => {
    const slider = useRef(null);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch(`${apiURL}/api/doctors`);
                const data = await response.json();
                setDoctors(data);
            } catch (error) {
                console.error("Error fetching doctors:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    const settings = {
        accessibility: true,
        dots: true,
        infinite: true,
        speed: 500,
        arrows: false,
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [
            { breakpoint: 1023, settings: { slidesToShow: 3, slidesToScroll: 3, infinite: true, dots: true } },
            { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 2, initialSlide: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1, initialSlide: 2 } },
        ],
    };

    if (loading) {
        return <div className="text-center mt-20">Loading doctors...</div>;
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex flex-col justify-center lg:px-32 px-5 pt-16">
                <div className="flex flex-col items-center lg:flex-row justify-between mb-10 lg:mb-0">
                    <div>
                        <h1 className="text-4xl font-semibold text-center lg:text-start">Our Doctors</h1>
                        <p className="mt-2 text-center lg:text-start">Meet our experienced medical professionals.</p>
                    </div>
                    <div className="flex gap-5 mt-4 lg:mt-0">
                        <button
                            className="bg-[#d5f2ec] text-backgroundColor px-4 py-2 rounded-lg active:bg-[#ade9dc]"
                            onClick={() => slider.current.slickPrev()}
                        >
                            <FaArrowLeft size={25} />
                        </button>
                        <button
                            className="bg-[#d5f2ec] text-backgroundColor px-4 py-2 rounded-lg active:bg-[#ade9dc]"
                            onClick={() => slider.current.slickNext()}
                        >
                            <FaArrowRight size={25} />
                        </button>
                    </div>
                </div>

                <div className="mt-5">
                    <Slider ref={slider} {...settings}>
                        {doctors.map((doc) => (
                            <div
                                className="h-[350px] text-black rounded-xl shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] mb-2 cursor-pointer"
                                key={doc.doctor_id}
                            >
                                <div>
                                    <img
                                        src={doc.image || "/src/assets/img/default-doc.jpg"}
                                        alt={doc.name}
                                        className="h-56 rounded-t-xl w-full object-cover"
                                    />
                                </div>

                                <div className="flex flex-col justify-center items-center">
                                    <h1 className="font-semibold text-xl pt-4">{doc.name}</h1>
                                    <h3 className="pt-2">{doc.specialization}</h3>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </>

    );
};

export default Dr;
