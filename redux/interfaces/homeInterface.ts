export interface Slider {
   title: string;
   description: string;
   image: string;
}

export interface SubLabel{
    title: string;
}

export interface Navitem{
    main_label: string;
    sub_label: SubLabel[];
}

interface ICategoryImage{
    url:string;
}

export interface Category {
    main_label: string;
    category_image: ICategoryImage;
}
export interface HomeState {
    status: boolean;
    loading: boolean;
    sliders: Slider[] | null;
    navitems:Navitem[];
    category: Category[];
    error: string | null;
    success: string | null;
}
