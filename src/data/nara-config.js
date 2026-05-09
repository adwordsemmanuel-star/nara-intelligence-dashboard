/**
 * NARA Intelligence OS - Configuration Data
 * Centralized source of truth for pricing, specialists, and services.
 */

export const PRICING = {
    adults: {
        director: {
            name: "Emmanuel Reyes",
            price: 1300,
            label: "Director Clínico"
        },
        specialists: {
            name: "Adriana Garduza y Angélica Lara",
            price: 1000,
            label: "Especialistas Senior"
        }
    },
    couples: {
        director: {
            name: "Emmanuel Reyes",
            price: 1400,
            label: "Director Clínico"
        },
        specialists: {
            name: "Adriana Garduza y Angélica Lara",
            price: 1200,
            label: "Especialistas Senior"
        }
    },
    kids: {
        specialist: {
            name: "Aracelly Rodríguez",
            price: 1000,
            packagePrice: 3600,
            packageSessions: 5,
            label: "Especialista Infantil"
        }
    }
};

export const SPECIALISTS = [
    {
        id: "emmanuel",
        name: "Emmanuel Reyes",
        role: "Director Clínico",
        specialties: ["Pareja", "Individual Adultos"],
        image: "/assets/team/emmanuel.jpg"
    },
    {
        id: "adriana",
        name: "Adriana Garduza",
        role: "Especialista Senior",
        specialties: ["Pareja", "Individual Adultos"],
        image: "/assets/team/adriana.jpg"
    },
    {
        id: "angelica",
        name: "Angélica Lara",
        role: "Especialista Senior",
        specialties: ["Pareja", "Individual Adultos"],
        image: "/assets/team/angelica.jpg"
    },
    {
        id: "aracelly",
        name: "Aracelly Rodríguez",
        role: "Especialista Infantil",
        specialties: ["Niños", "Adolescentes"],
        image: "/assets/team/aracelly.jpg"
    }
];

export const SERVICES = {
    pareja: {
        title: "Terapia de Pareja",
        description: "Reconstruye la conexión y el entendimiento con técnicas clínicas avanzadas.",
        specialists: ["emmanuel", "adriana", "angelica"],
        pricing: PRICING.couples
    },
    individual: {
        title: "Terapia Adultos Individual",
        description: "Un espacio seguro para tu crecimiento personal y bienestar emocional.",
        specialists: ["emmanuel", "adriana", "angelica"],
        pricing: PRICING.adults
    },
    infantil: {
        title: "Terapia Niños y Adolescentes",
        description: "Acompañamiento especializado para el desarrollo saludable de los más jóvenes.",
        specialists: ["aracelly"],
        pricing: PRICING.kids
    }
};
