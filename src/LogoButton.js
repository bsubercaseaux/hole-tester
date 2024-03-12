import React from 'react';
import { Tooltip } from 'react-tooltip'

// Assuming the 'logo' prop is a React component or an image URL
function LogoButton({ onClick, logo, style, selected, tooltip="?" }) {
  return (
    <button onClick={onClick} className={`btn ${selected ? 'selected' :''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height:40, padding:0, marginRight:10, ...style }}
      data-tooltip-id={`btn-tt-${tooltip}`} data-tooltip-content={tooltip}  >
      <Tooltip id={`btn-tt-${tooltip}`} />
      {React.isValidElement(logo) ? (
        // Render the logo as a React component
        React.cloneElement(logo, { style: { marginRight: 8 } })
      ) : (
        // Render the logo as an image
        <img src={logo} alt="Logo" style={{  height: "80%", width: "80%"}} />
      )}
      {/* Click me */}
    </button>
  );
}

export default LogoButton;
