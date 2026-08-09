import React from 'react';
import { icons } from '../../constData';

/**
 * ProductCard Component
 * Displays a compact, premium product item card for the POS Sales grid.
 * Enforces identical card heights, image aspects, and typography alignments.
 */
export const ProductCard = ({ product, cartItem, onAdd, onRemove }) => {
  const isActive = !!cartItem;
  
  return (
    <div 
      className={`group flex flex-col justify-between bg-white border rounded-2xl overflow-hidden transition-all duration-200
        ${isActive 
          ? 'border-amber-800 ring-1 ring-amber-800/50 shadow-md shadow-amber-800/5 translate-y-[-2px]' 
          : 'border-gray-200/80 hover:border-amber-700/30 hover:shadow-md hover:shadow-gray-100 hover:translate-y-[-2px]'
        }`}
    >
      {/* Product Image Container */}
      <div className="aspect-[3/4] relative w-full bg-gray-50 overflow-hidden border-b border-gray-100">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <icons.productIcon className="h-8 w-8 text-gray-300" />
          </div>
        )}
        
        {/* Selection / Quantity Badge */}
        {isActive && (
          <div className="absolute top-2.5 right-2.5 bg-amber-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-fade-in">
            {cartItem.quantity}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 p-3.5 space-y-3 justify-between">
        <div className="space-y-1">
          {/* Enforces consistent height (up to 2 lines) so grid rows stay aligned */}
          <h3 
            className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 min-h-[2.5rem] flex items-center"
            title={product.name}
          >
            {product.name}
          </h3>
          <div className="text-base font-extrabold text-amber-900">
            ₹{product.price}
          </div>
        </div>

        {/* Action Button Section */}
        <div className="pt-0.5">
          {isActive ? (
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200/60 rounded-xl p-1 w-full animate-fade-in">
              <button 
                onClick={onRemove}
                className="flex items-center justify-center h-8 w-8 text-amber-800 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer active:scale-90"
                title="Decrease quantity"
              >
                <icons.minusIcon className="h-3 w-3" />
              </button>
              <span className="text-xs font-bold text-amber-900 px-1">{cartItem.quantity} added</span>
              <button 
                onClick={onAdd}
                className="flex items-center justify-center h-8 w-8 text-amber-800 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer active:scale-90"
                title="Increase quantity"
              >
                <icons.plusIcon className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onAdd}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-bold text-white bg-amber-800 rounded-xl hover:bg-amber-900 active:scale-95 transition-all shadow-sm shadow-amber-800/10 cursor-pointer"
            >
              <span>+ Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
