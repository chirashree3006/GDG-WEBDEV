"use client";

import React from "react";

const Card = ({ title, description, bgColor, Icon }) => {
  return (
    <div className="group relative h-80 w-64 cursor-pointer">
      <div className="absolute inset-0 rounded-xl bg-white transition-transform duration-300"></div>

      <div
        className="relative z-10 h-full w-full overflow-hidden rounded-xl p-6 text-white transition-transform duration-300 group-hover:-translate-x-2 group-hover:-translate-y-2"
        style={{ backgroundColor: bgColor || "#ffffff" }}
      >
        <div className="absolute right-4 top-4 text-white/10">
          {Icon && <Icon size={110} />}
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <h3 className="text-2xl font-bold">{title}</h3>
          </div>

          <div>
            <p className="text-sm text-white/80">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
