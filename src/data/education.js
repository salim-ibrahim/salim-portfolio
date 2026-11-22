import ugLogo from "../assets/Education/ug_logo.png";
import ugImage3 from "../assets/Education/ug_image3.png";
import aggreyLogo from "../assets/Education/aggrey_logo.png";
import aggreyImage1 from "../assets/Education/aggrey_image1.png";

export const educationData = [
    {
        id: 1,
        institution: "University of Ghana",
        qualification: "BSc. Agricultural Economics",
        result: "Second Upper",
        location: "Accra, Ghana.",
        major: [
            "Econometrics",
            "Project Analysis",
            "Agricultural Marketing and Price Analysis",
            "Economic Theory",
        ],
        imageCaption: "University of Ghana",
        imageLocation: "— Legon, Accra",
        logo: ugLogo,
        image: ugImage3,
        logoAlt: "University of Ghana logo",
        imageAlt: "University of Ghana campus",
    },
    {
        id: 2,
        institution: "Aggrey Memorial A.M.E. Zion Senior High School",
        qualification: "WASSCE. General Science",
        result: "Pass",
        location: "Cape Coast, Ghana",
        major: [
            "Elective Mathematics",
            "Physics",
            "Chemistry",
        ],
        imageCaption: "Aggrey Memorial A.M.E. Zion Senior High School",
        imageLocation: "— Cape Coast",
        logo: aggreyLogo,
        image: aggreyImage1,
        logoAlt: "Aggrey Memorial logo",
        imageAlt: "Aggrey Memorial campus",
    },
];