import { useState, useRef, useEffect } from 'react';

// Milestones in kg CO2 saved — each one unlocks a growth stage
const MILESTONES = [1, 5, 10, 25, 50];

// Derive stage (0–5) from carbonSaved
// Stage 4 = lush leaves (25kg), Stage 5 = full bloom sunflower (50kg only)
function stageFromCarbon(carbonSaved) {
  let s = 0;
  for (let i = 0; i < MILESTONES.length; i++) {
    if (carbonSaved >= MILESTONES[i]) s = i + 1;
  }
  return s;
}

const stemYByStage = [248, 244, 238, 230, 222, 212];
const stageLabels   = ['', 'sprout', 'seedling', 'young plant', 'lush leaves', 'full bloom 🌻'];

const PlantStage = ({ stage, sy }) => {
  if (stage === 0) return null;

  if (stage === 1) return (
    <>
      <line x1="309" y1={sy} x2="309" y2={sy+16} stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="309" cy={sy}   rx="5" ry="8" fill="#66BB6A" transform={`rotate(-15,309,${sy})`}/>
      <ellipse cx="309" cy={sy}   rx="5" ry="8" fill="#81C784" transform={`rotate(15,309,${sy})`}/>
    </>
  );

  if (stage === 2) return (
    <>
      <line x1="309" y1={sy} x2="309" y2={sy+26} stroke="#5D4037" strokeWidth="3" strokeLinecap="round"/>
      <ellipse cx="309" cy={sy+4}  rx="7" ry="11" fill="#4CAF50" transform={`rotate(-20,309,${sy+4})`}/>
      <ellipse cx="309" cy={sy+4}  rx="7" ry="11" fill="#66BB6A" transform={`rotate(18,309,${sy+4})`}/>
      <ellipse cx="309" cy={sy+14} rx="6" ry="9"  fill="#81C784" transform={`rotate(-35,309,${sy+14})`}/>
    </>
  );

  if (stage === 3) return (
    <>
      <line x1="309" y1={sy} x2="309" y2={sy+34} stroke="#5D4037" strokeWidth="3" strokeLinecap="round"/>
      <ellipse cx="309" cy={sy}    rx="9"  ry="14" fill="#4CAF50" transform={`rotate(-18,309,${sy})`}/>
      <ellipse cx="309" cy={sy}    rx="9"  ry="14" fill="#43A047" transform={`rotate(10,309,${sy})`}/>
      <ellipse cx="309" cy={sy+10} rx="8"  ry="12" fill="#66BB6A" transform={`rotate(28,309,${sy+10})`}/>
      <ellipse cx="309" cy={sy+10} rx="7"  ry="11" fill="#81C784" transform={`rotate(-30,309,${sy+10})`}/>
    </>
  );

  // Stage 4: lush leafy plant — NO flower
  if (stage === 4) return (
    <>
      <line x1="309" y1={sy} x2="309" y2={sy+42} stroke="#5D4037" strokeWidth="3.5" strokeLinecap="round"/>
      <ellipse cx="309" cy={sy-2}  rx="11" ry="17" fill="#4CAF50" transform={`rotate(-14,309,${sy-2})`}/>
      <ellipse cx="309" cy={sy-2}  rx="11" ry="17" fill="#388E3C" transform={`rotate(8,309,${sy-2})`}/>
      <ellipse cx="309" cy={sy+12} rx="10" ry="14" fill="#66BB6A" transform={`rotate(26,309,${sy+12})`}/>
      <ellipse cx="309" cy={sy+12} rx="9"  ry="13" fill="#43A047" transform={`rotate(-32,309,${sy+12})`}/>
      <ellipse cx="309" cy={sy+24} rx="8"  ry="11" fill="#81C784" transform={`rotate(-18,309,${sy+24})`}/>
      <ellipse cx="309" cy={sy+24} rx="7"  ry="10" fill="#66BB6A" transform={`rotate(22,309,${sy+24})`}/>
    </>
  );

  // Stage 5: full bloom with sunflower — only at 50kg milestone
  return (
    <>
      <line x1="309" y1={sy} x2="309" y2={sy+46} stroke="#5D4037" strokeWidth="3.5" strokeLinecap="round"/>
      <ellipse cx="309" cy={sy-4}  rx="11" ry="17" fill="#4CAF50" transform={`rotate(-14,309,${sy-4})`}/>
      <ellipse cx="309" cy={sy-4}  rx="11" ry="17" fill="#388E3C" transform={`rotate(8,309,${sy-4})`}/>
      <ellipse cx="309" cy={sy+10} rx="10" ry="14" fill="#66BB6A" transform={`rotate(26,309,${sy+10})`}/>
      <ellipse cx="309" cy={sy+10} rx="9"  ry="13" fill="#43A047" transform={`rotate(-32,309,${sy+10})`}/>
      <ellipse cx="309" cy={sy+22} rx="8"  ry="11" fill="#81C784" transform={`rotate(-18,309,${sy+22})`}/>
      {/* Sunflower — only stage 5 */}
      <ellipse cx="298" cy={sy-22} rx="5" ry="8" fill="#FFCA28" transform={`rotate(-30,298,${sy-22})`}/>
      <ellipse cx="320" cy={sy-22} rx="5" ry="8" fill="#FFCA28" transform={`rotate(30,320,${sy-22})`}/>
      <ellipse cx="293" cy={sy-14} rx="5" ry="8" fill="#FFCA28" transform={`rotate(-60,293,${sy-14})`}/>
      <ellipse cx="325" cy={sy-14} rx="5" ry="8" fill="#FFCA28" transform={`rotate(60,325,${sy-14})`}/>
      <circle cx="309" cy={sy-18} r="11" fill="#FFC107"/>
      <circle cx="309" cy={sy-18} r="7"  fill="#FF8F00"/>
    </>
  );
};

// Props: carbonSaved (number, kg CO2)
const WateringAvatar = ({ carbonSaved = 0 }) => {
  const targetStage = stageFromCarbon(carbonSaved);
  const [displayStage, setDisplayStage] = useState(targetStage);
  const [watering, setWatering]         = useState(false);
  const [growing, setGrowing]           = useState(false);
  const busy = useRef(false);

  // If carbonSaved changes externally, animate up to the new stage
  useEffect(() => {
    if (targetStage > displayStage) {
      setGrowing(true);
      setDisplayStage(targetStage);
      setTimeout(() => setGrowing(false), 600);
    }
  }, [targetStage]);

  const atMax     = displayStage >= MILESTONES.length;
  const nextGoal  = atMax ? null : MILESTONES[displayStage];

  const doWater = () => {
    if (busy.current || atMax) return;
    busy.current = true;
    setWatering(true);
    // Animation only — plant stage is controlled by carbonSaved prop
    setTimeout(() => {
      setWatering(false);
      busy.current = false;
    }, 1400);
  };

  const sy = stemYByStage[displayStage];

  return (
    <div className="flex flex-col items-center select-none">
      <style>{`
        @keyframes av-tilt {
          0%   { transform: rotate(0deg); }
          40%  { transform: rotate(-42deg); }
          70%  { transform: rotate(-42deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes av-arm {
          0%   { transform: rotate(0deg); }
          40%  { transform: rotate(-30deg); }
          70%  { transform: rotate(-30deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes av-drop {
          0%   { opacity: 0; transform: translateY(0px); }
          20%  { opacity: 1; }
          80%  { opacity: 1; transform: translateY(22px); }
          100% { opacity: 0; transform: translateY(28px); }
        }
        @keyframes av-pop {
          0%   { transform: scaleY(0.8); }
          60%  { transform: scaleY(1.12); }
          100% { transform: scaleY(1); }
        }
        .av-can { cursor: pointer; transform-origin: 230px 195px; }
        .av-can.on { animation: av-tilt 1.2s ease-in-out forwards; }
        .av-can.done { cursor: default; opacity: 0.6; }
        .av-arm { transform-origin: 198px 192px; }
        .av-arm.on { animation: av-arm 1.2s ease-in-out forwards; }
        .av-drop { opacity: 0; }
        .av-drop.on { animation: av-drop 1s ease-in forwards; }
        .av-drop.on:nth-child(2) { animation-delay: 0.08s; }
        .av-drop.on:nth-child(3) { animation-delay: 0.16s; }
        .av-plant { transform-origin: 309px 260px; }
        .av-plant.on { animation: av-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      `}</style>

      <svg viewBox="0 0 400 300" width="200" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect x="60" y="265" width="320" height="5" rx="2.5" fill="#d4c4a8" opacity="0.5"/>

        <g className={`av-plant${growing ? ' on' : ''}`}>
          <rect x="278" y="256" width="62" height="18" rx="4" fill="#8B5E3C"/>
          <rect x="285" y="248" width="48" height="12" rx="3" fill="#7a5230"/>
          <PlantStage stage={displayStage} sy={sy} />
        </g>

        <g>
          <ellipse className={`av-drop${watering ? ' on' : ''}`} cx="256" cy="188" rx="2.5" ry="4" fill="#64B5F6"/>
          <ellipse className={`av-drop${watering ? ' on' : ''}`} cx="264" cy="192" rx="2"   ry="3.5" fill="#64B5F6"/>
          <ellipse className={`av-drop${watering ? ' on' : ''}`} cx="248" cy="193" rx="2"   ry="3.5" fill="#64B5F6"/>
        </g>

        <g>
          <ellipse cx="155" cy="268" rx="18" ry="5" fill="#bbb" opacity="0.35"/>
          <rect x="134" y="185" width="46" height="58" rx="12" fill="#4CAF50"/>
          <rect x="139" y="185" width="36" height="14" rx="5" fill="#81C784" opacity="0.6"/>
          <rect x="137" y="230" width="14" height="36" rx="7" fill="#C8A882"/>
          <rect x="163" y="230" width="14" height="36" rx="7" fill="#C8A882"/>
          <rect x="135" y="260" width="18" height="8" rx="4" fill="#4CAF50" opacity="0.7"/>
          <rect x="161" y="260" width="18" height="8" rx="4" fill="#4CAF50" opacity="0.7"/>
          <rect x="126" y="185" width="16" height="34" rx="8" fill="#FFF9C4"/>
          <rect x="126" y="185" width="16" height="34" rx="8" fill="#4CAF50" opacity="0.55"/>
        </g>

        <g className={`av-arm${watering ? ' on' : ''}`}>
          <rect x="172" y="185" width="46" height="15" rx="7" fill="#FFF9C4"/>
          <rect x="172" y="185" width="46" height="15" rx="7" fill="#4CAF50" opacity="0.5"/>
          <ellipse cx="199" cy="193" rx="9" ry="8" fill="#C8A882"/>
        </g>

        <g
          className={`av-can${watering ? ' on' : ''}${atMax ? ' done' : ''}`}
          onClick={doWater}
        >
          <rect x="205" y="178" width="44" height="32" rx="8" fill="#4CAF50"/>
          <rect x="207" y="180" width="40" height="14" rx="6" fill="#66BB6A" opacity="0.5"/>
          <path d="M249 188 Q260 180 268 185 L265 192 Q256 188 249 196 Z" fill="#388E3C"/>
          <path d="M249 196 Q255 202 248 210 L244 207 Q250 200 245 193 Z" fill="#388E3C"/>
          <ellipse cx="212" cy="188" rx="5" ry="6" fill="#388E3C" opacity="0.4"/>
          <rect x="218" y="172" width="20" height="8" rx="4" fill="#388E3C"/>
        </g>

        <g>
          <ellipse cx="155" cy="148" rx="28" ry="32" fill="#C8A882"/>
          <rect x="146" y="177" width="19" height="9"  fill="#C8A882"/>
          <ellipse cx="142" cy="130" rx="15" ry="15" fill="#3E2000"/>
          <ellipse cx="168" cy="130" rx="15" ry="15" fill="#3E2000"/>
          <ellipse cx="155" cy="115" rx="15" ry="15" fill="#3E2000"/>
          <ellipse cx="142" cy="115" rx="7" ry="7" fill="#3E2000"/>
          <ellipse cx="168" cy="115" rx="7" ry="7" fill="#3E2000"/>
          <rect x="135" y="115" width="39" height="4" rx="3" fill="#4CAF50"/>
          <ellipse cx="145" cy="152" rx="5" ry="6" fill="#fff"/>
          <ellipse cx="165" cy="152" rx="5" ry="6" fill="#fff"/>
          <circle cx="146" cy="153" r="3" fill="#2c2c2c"/>
          <circle cx="166" cy="153" r="3" fill="#2c2c2c"/>
          <circle cx="147" cy="152" r="1" fill="#fff"/>
          <circle cx="167" cy="152" r="1" fill="#fff"/>
          <ellipse cx="143" cy="164" rx="4" ry="2.5" fill="#B07D55" opacity="0.5"/>
          <ellipse cx="167" cy="164" rx="4" ry="2.5" fill="#B07D55" opacity="0.5"/>
          <path d="M148 168 Q155 175 162 168" stroke="#a0522d" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </g>
      </svg>

      {displayStage > 0 && (
        <p className="text-xs text-green-600 font-medium -mt-1">{stageLabels[displayStage]}</p>
      )}
      <p className="text-xs text-green-600 opacity-60 mt-0.5">
        {atMax
          ? 'fully grown! 🌻'
          : nextGoal
          ? `reach ${nextGoal} kg CO₂ to grow`
          : 'save eco meals to grow'}
      </p>
    </div>
  );
};

export default WateringAvatar;