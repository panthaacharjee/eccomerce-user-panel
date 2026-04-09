"use client";
import React, { useEffect, useState } from "react";
import ImageCarousel, { CarouselImage } from "./ImageCarousel";
import { useDispatch, useSelector } from "react-redux";
import { GetSliderFail, GetSliderRequest, GetSliderSuccess } from "@/redux/reducers/homeReducer";
import Axios from "./Axios";
import { RootState } from "@/redux/rootReducer";

const Carousel: React.FC = () => {
  const dispatch = useDispatch();
  const {sliders} = useSelector((state:RootState) => state.home);

  const [autoPlay, setAutoPlay] = useState(true);
  const [showNavigation, setShowNavigation] = useState(true);
  const [showIndicators, setShowIndicators] = useState(true);
  const [transitionSpeed, setTransitionSpeed] = useState(500);

    const carouselImages: CarouselImage[] = sliders ? sliders.map((slider, index) => ({   
      id:  index,
      image: slider.image,
      alt: slider.image,
      title: slider.title,
      description: slider.description
    })) : [];

  const getSliderData = async() => {
    try{
      dispatch(GetSliderRequest())
      const {data} = await Axios.get("/all/sliders")

      dispatch(GetSliderSuccess(data))
      
    }catch(err:any){
      dispatch(GetSliderFail(err.response.data.message))
    }
  }

  useEffect(()=>{
    getSliderData();
  },[])

  return (
    <div className="">
      <div className="container w-full mx-auto">
        <div className="">
          <ImageCarousel
            images={carouselImages}
            autoPlay={autoPlay}
            autoPlayInterval={3000}
            showNavigation={showNavigation}
            showIndicators={showIndicators}
            transitionDuration={transitionSpeed}
          />
        </div>
      </div>
    </div>
  );
};

export default Carousel;
