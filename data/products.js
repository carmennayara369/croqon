// Product database for Croqon B2B Portal
export const products = [
  {
    id: "manchego-semicurado",
    name: "Manchego Semicurado",
    description: "Cremosas y delicadas, elaboradas con queso Manchego semicurado.",
    price: 75.00, // Price in EUR per box of 150 units
    units: 150,
    weight: 30,
    icon: "cheese",
    flavorProfile: "Cheese / Cremoso",
    ingredients: "Leche entera, queso Manchego semicurado (12%), harina de trigo, mantequilla, pan rallado, huevo, sal, gelatina.",
    allergens: ["Gluten", "Lácteos", "Huevo"],
    imageType: "grid",
    imageClass: "img-manchego-semi",
    badge: "Receta Cremosa"
  },
  {
    id: "chorizo-iberico",
    name: "Chorizo Ibérico de Bellota",
    description: "Sabor intenso y ligeramente picante, con auténtico chorizo ibérico de bellota.",
    price: 82.50,
    units: 150,
    weight: 30,
    icon: "sausage",
    flavorProfile: "Ibérico / Picante",
    ingredients: "Leche entera, chorizo ibérico de bellota (15%), harina de trigo, mantequilla, cebolla, pan rallado, huevo, especias, sal.",
    allergens: ["Gluten", "Lácteos", "Huevo"],
    imageType: "grid",
    imageClass: "img-chorizo",
    badge: "Sabor Intenso"
  },
  {
    id: "manchego-serrano",
    name: "Manchego y Serrano",
    description: "La combinación perfecta entre queso Manchego semicurado y jamón Serrano.",
    price: 78.00,
    units: 150,
    weight: 30,
    icon: "ham-cheese",
    flavorProfile: "Mixto / Tradicional",
    ingredients: "Leche entera, queso Manchego semicurado (8%), jamón serrano (8%), harina de trigo, mantequilla, pan rallado, huevo, sal.",
    allergens: ["Gluten", "Lácteos", "Huevo"],
    imageType: "grid",
    imageClass: "img-manchego-serrano",
    badge: "Equilibrio Perfecto"
  },
  {
    id: "jamon-iberico",
    name: "Jamón Ibérico de Bellota",
    description: "Elaboradas con jamón ibérico de bellota, para un sabor profundo e inigualable.",
    price: 90.00,
    units: 150,
    weight: 30,
    icon: "ham",
    flavorProfile: "Ibérico / Premium",
    ingredients: "Leche entera, jamón ibérico de bellota (18%), harina de trigo, mantequilla de Soria, caldo de jamón, pan rallado, huevo, sal.",
    allergens: ["Gluten", "Lácteos", "Huevo"],
    imageType: "grid",
    imageClass: "img-jamon-iberico",
    badge: "Joyas Gastronómicas"
  },
  {
    id: "jamon-serrano-gr",
    name: "Jamón Serrano Gran Reserva",
    description: "Cremosa bechamel elaborada con leche entera y mantequilla, combinada con jamón serrano Gran Reserva (17%). Sabor intenso y tradicional, con textura crujiente por fuera y cremosa por dentro.",
    price: 85.00,
    units: 150,
    weight: 30,
    icon: "chef",
    flavorProfile: "Tradicional / Gran Reserva",
    ingredients: "Leche entera, jamón serrano Gran Reserva (17%) (jamón de cerdo, sal, conservadores E-252, E-250), harina de trigo, queso manchego semicurado (9%), mantequilla (leche), pan rallado, huevo entero líquido, caldo de pollo (contiene apio), sal.",
    allergens: ["Gluten", "Lácteos", "Huevo", "Apio"],
    imageType: "sheet",
    imageClass: "img-jamon-serrano-gr",
    badge: "Calidad Excepcional"
  }
];
