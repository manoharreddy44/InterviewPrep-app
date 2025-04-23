import React from 'react'

export default function GenderCheckbox({ onCheckboxChange, selectedGender }) {
  return (
    <div className="flex gap-6">
      <label className="flex items-center gap-2 text-gray-300 text-sm">
        <input
          type="radio"
          name="gender"
          value="male"
          checked={selectedGender === "male"}
          onChange={(e) => onCheckboxChange(e.target.value)}
          className="form-radio text-indigo-500 focus:ring-indigo-400 border-gray-600 bg-gray-800/50"
        />
        <span>Male</span>
      </label>
      <label className="flex items-center gap-2 text-gray-300 text-sm">
        <input
          type="radio"
          name="gender"
          value="female"
          checked={selectedGender === "female"}
          onChange={(e) => onCheckboxChange(e.target.value)}
          className="form-radio text-indigo-500 focus:ring-indigo-400 border-gray-600 bg-gray-800/50"
        />
        <span>Female</span>
      </label>
    </div>
  )
}
