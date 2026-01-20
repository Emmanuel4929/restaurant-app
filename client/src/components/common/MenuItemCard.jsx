// src/components/common/MenuItemCard.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";

function MenuItemCard({ item, onAdd }) {
  const [adding, setAdding] = useState(false);

  const handleClick = async () => {
    setAdding(true);
    try {
      // onAdd puede ser síncrono o devolver una promesa
      await Promise.resolve(onAdd(item));
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 flex flex-col justify-between shadow hover:shadow-lg transition mb-4">
      {/* Imagen, si existe */}
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-32 object-cover rounded mb-2"
        />
      )}

      {/* Nombre, categoría y descripción */}
      <div>
        {item.category && (
          <span className="text-sm uppercase text-gray-500">
            {item.category}
          </span>
        )}
        <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
        <p className="text-gray-600 mb-2">
          {item.description || "Sin descripción"}
        </p>
      </div>

      {/* Precio y calorías */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl font-bold">${item.price.toFixed(2)}</span>
        {item.calories != null && (
          <span className="text-sm text-gray-500">{item.calories} kcal</span>
        )}
      </div>

      {/* Botón añadir */}
      <button
        type="button" // (1) evita submit
        aria-label={`Añadir ${item.name} al carrito`} // (2) accesibilidad
        onClick={handleClick}
        disabled={adding}
        className={`px-3 py-1 rounded text-white transition ${
          adding
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {/* (8) feedback visual */}
        {adding ? "Añadiendo…" : "Añadir"}
      </button>
    </div>
  );
}

// (7) PropTypes para documentar props
MenuItemCard.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    calories: PropTypes.number,
    category: PropTypes.string,
    imageUrl: PropTypes.string,
  }).isRequired,
  onAdd: PropTypes.func.isRequired,
};

// (6) Memo para evitar rerenders innecesarios
export default React.memo(MenuItemCard);
