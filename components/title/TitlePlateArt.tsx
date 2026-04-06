const blossomClusters = [
  { x: 84, y: 188, r: 74 },
  { x: 182, y: 236, r: 60 },
  { x: 280, y: 286, r: 54 },
  { x: 760, y: 164, r: 76 },
  { x: 666, y: 226, r: 60 },
  { x: 580, y: 284, r: 50 },
  { x: 140, y: 428, r: 58 },
  { x: 754, y: 448, r: 54 },
  { x: 92, y: 1348, r: 64 },
  { x: 806, y: 1328, r: 68 }
] as const;

const floatingPetals = [
  { x: 168, y: 548, w: 22, h: 12, rotate: -16 },
  { x: 274, y: 724, w: 18, h: 10, rotate: 18 },
  { x: 676, y: 628, w: 22, h: 12, rotate: -22 },
  { x: 744, y: 794, w: 18, h: 10, rotate: 8 },
  { x: 366, y: 642, w: 16, h: 10, rotate: 14 },
  { x: 590, y: 880, w: 18, h: 10, rotate: -8 },
  { x: 236, y: 1010, w: 16, h: 10, rotate: 10 }
] as const;

const koiFish = [
  { x: 286, y: 1180, rx: 28, ry: 10, fill: "#FFB78B", tail: "#FFE3C9" },
  { x: 594, y: 1234, rx: 32, ry: 11, fill: "#F39A62", tail: "#FFD2AE" },
  { x: 494, y: 1104, rx: 22, ry: 8, fill: "#FFCE9C", tail: "#FFE8D3" }
] as const;

const stoneLanterns = [
  { x: 118, y: 1040 },
  { x: 776, y: 1036 },
  { x: 212, y: 872 },
  { x: 670, y: 864 }
] as const;

export function TitlePlateArt() {
  return (
    <svg
      aria-hidden="true"
      className="title-plate-svg"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 900 1600"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="garden-sky" x1="450" x2="450" y1="0" y2="1600" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0C1119" />
          <stop offset="0.18" stopColor="#121723" />
          <stop offset="0.44" stopColor="#1B2030" />
          <stop offset="0.68" stopColor="#101722" />
          <stop offset="1" stopColor="#060A10" />
        </linearGradient>
        <radialGradient id="moon-glow" cx="0" cy="0" r="1" gradientTransform="translate(470 232) rotate(90) scale(262 228)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D3E1F5" stopOpacity="0.92" />
          <stop offset="0.34" stopColor="#A8BEDB" stopOpacity="0.28" />
          <stop offset="1" stopColor="#A8BEDB" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="title-clearing" cx="0" cy="0" r="1" gradientTransform="translate(450 742) rotate(90) scale(192 224)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF0DE" stopOpacity="0.12" />
          <stop offset="0.38" stopColor="#B8926F" stopOpacity="0.08" />
          <stop offset="1" stopColor="#0B0F17" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="water-gradient" cx="0" cy="0" r="1" gradientTransform="translate(450 1172) rotate(90) scale(356 448)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5D7D8E" stopOpacity="0.98" />
          <stop offset="0.3" stopColor="#2A4054" stopOpacity="0.94" />
          <stop offset="0.72" stopColor="#0E1824" stopOpacity="0.98" />
          <stop offset="1" stopColor="#060A10" />
        </radialGradient>
        <radialGradient id="water-sheen" cx="0" cy="0" r="1" gradientTransform="translate(446 1124) rotate(90) scale(188 286)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F6D8AA" stopOpacity="0.3" />
          <stop offset="0.36" stopColor="#C8DDF5" stopOpacity="0.18" />
          <stop offset="1" stopColor="#C8DDF5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="stream-gradient" x1="154" x2="360" y1="986" y2="1122" gradientUnits="userSpaceOnUse">
          <stop stopColor="#173246" stopOpacity="0.06" />
          <stop offset="0.48" stopColor="#A2BED2" stopOpacity="0.76" />
          <stop offset="1" stopColor="#28475B" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="dock-wood" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#9A6A4A" />
          <stop offset="1" stopColor="#4A2B23" />
        </linearGradient>
        <linearGradient id="bridge-wood" x1="192" x2="716" y1="668" y2="668" gradientUnits="userSpaceOnUse">
          <stop stopColor="#61392E" />
          <stop offset="0.5" stopColor="#8E5241" />
          <stop offset="1" stopColor="#553228" />
        </linearGradient>
        <linearGradient id="temple-roof" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#5A432E" />
          <stop offset="1" stopColor="#2E1F18" />
        </linearGradient>
        <linearGradient id="temple-wall" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#B7905E" />
          <stop offset="1" stopColor="#795A3E" />
        </linearGradient>
        <linearGradient id="tree-bark" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#4A3126" />
          <stop offset="1" stopColor="#2A1816" />
        </linearGradient>
        <radialGradient id="blossom-petal" cx="0" cy="0" r="1" gradientTransform="translate(0 0) rotate(90) scale(52 52)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF1F5" />
          <stop offset="0.54" stopColor="#F6C4D9" />
          <stop offset="1" stopColor="#D785A8" />
        </radialGradient>
        <radialGradient id="lantern-glow" cx="0" cy="0" r="1" gradientTransform="translate(0 0) rotate(90) scale(98 74)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE3BC" stopOpacity="0.92" />
          <stop offset="0.46" stopColor="#F6AE69" stopOpacity="0.34" />
          <stop offset="1" stopColor="#F6AE69" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lantern-core" cx="0" cy="0" r="1" gradientTransform="translate(0 0) rotate(90) scale(26 24)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF3D6" />
          <stop offset="1" stopColor="#F0B36F" />
        </radialGradient>
        <radialGradient id="stone-shade" cx="0" cy="0" r="1" gradientTransform="translate(0 0) rotate(90) scale(82 42)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9EA3A6" />
          <stop offset="0.5" stopColor="#73777C" />
          <stop offset="1" stopColor="#4E5358" />
        </radialGradient>
        <radialGradient id="moss-glow" cx="0" cy="0" r="1" gradientTransform="translate(0 0) rotate(90) scale(136 136)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4E6440" stopOpacity="0.86" />
          <stop offset="0.54" stopColor="#31452C" stopOpacity="0.34" />
          <stop offset="1" stopColor="#31452C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="green-light" cx="0" cy="0" r="1" gradientTransform="translate(540 672) rotate(90) scale(24 24)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C5FFB9" />
          <stop offset="0.42" stopColor="#8EED90" stopOpacity="0.84" />
          <stop offset="1" stopColor="#8EED90" stopOpacity="0" />
        </radialGradient>
        <filter id="garden-soft-blur" colorInterpolationFilters="sRGB" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <filter id="garden-medium-blur" colorInterpolationFilters="sRGB" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      <rect width="900" height="1600" fill="url(#garden-sky)" />
      <ellipse cx="470" cy="230" rx="274" ry="230" fill="url(#moon-glow)" />

      <g filter="url(#garden-soft-blur)" opacity="0.72">
        <ellipse cx="118" cy="284" rx="162" ry="268" fill="#203225" />
        <ellipse cx="784" cy="268" rx="176" ry="284" fill="#1B2A24" />
        <ellipse cx="448" cy="442" rx="300" ry="160" fill="#182227" />
      </g>

      <path
        d="M0 740C106 686 198 678 288 710C360 736 406 774 450 774C514 774 564 716 648 676C732 636 814 642 900 692V890H0V740Z"
        fill="#10161D"
        opacity="0.84"
      />
      <path
        d="M0 832C82 810 170 816 252 844C338 874 394 904 452 904C512 904 584 872 670 828C758 784 832 790 900 830V1016H0V832Z"
        fill="#0B0F16"
        opacity="0.92"
      />

      <g opacity="0.9">
        <path d="M454 238L560 282L534 314H374L348 282L454 238Z" fill="url(#temple-roof)" />
        <path d="M360 310H548V474H360V310Z" fill="url(#temple-wall)" opacity="0.9" />
        <path d="M380 334H528V460H380V334Z" fill="#3D281E" opacity="0.42" />
        <path d="M394 346H514V434H394V346Z" fill="#F0BE73" opacity="0.54" />
        <path d="M344 314H564V338H344V314Z" fill="#2C1B16" opacity="0.82" />
        <path d="M352 430H556V458H352V430Z" fill="#2B1B17" opacity="0.84" />
        <ellipse cx="452" cy="390" rx="162" ry="84" fill="#FFCF8A" filter="url(#garden-medium-blur)" opacity="0.12" />
      </g>

      <g className="title-svg-bridge" opacity="0.96">
        <path d="M188 690C262 584 340 530 450 530C560 530 640 584 714 690" fill="none" stroke="url(#bridge-wood)" strokeLinecap="round" strokeWidth="26" />
        <path d="M220 698C280 614 350 570 450 570C550 570 624 614 680 698" fill="none" stroke="#AF6A57" strokeLinecap="round" strokeWidth="8" opacity="0.52" />
        <path d="M216 688V734M268 620V706M324 574V680M384 546V656M516 546V656M578 574V680M636 620V706M688 688V734" stroke="#785146" strokeLinecap="round" strokeWidth="9" />
      </g>

      <g className="title-svg-water">
        <ellipse cx="450" cy="1168" rx="482" ry="382" fill="url(#water-gradient)" />
        <ellipse cx="452" cy="1106" rx="228" ry="154" fill="url(#water-sheen)" />
        <path
          d="M84 1038C176 1002 246 996 318 1020C380 1040 426 1078 460 1084C516 1094 592 1068 660 1026C730 984 796 972 860 988C832 1072 774 1148 690 1200C602 1254 506 1276 408 1260C308 1244 220 1180 166 1116C128 1072 104 1054 84 1038Z"
          fill="#13242F"
          opacity="0.72"
        />
        <path d="M130 990C194 960 238 956 296 972C356 990 408 1028 450 1040C518 1058 576 1038 654 984C724 936 782 922 834 932" stroke="url(#stream-gradient)" strokeLinecap="round" strokeWidth="24" opacity="0.94" />
        <path d="M170 1054C268 1088 352 1130 438 1150C534 1172 622 1164 740 1106" stroke="#FBE6C7" strokeLinecap="round" strokeWidth="10" opacity="0.1" />
        <path d="M250 1208C330 1220 386 1230 468 1230C568 1230 638 1210 702 1176" stroke="#E1EFFB" strokeLinecap="round" strokeWidth="4" opacity="0.18" />
      </g>

      <g className="title-svg-ripples" opacity="0.32">
        <ellipse cx="318" cy="1184" rx="58" ry="18" stroke="#E8F2FC" strokeWidth="2" />
        <ellipse cx="590" cy="1216" rx="66" ry="20" stroke="#E8F2FC" strokeWidth="2" />
        <ellipse cx="474" cy="1298" rx="52" ry="16" stroke="#E8F2FC" strokeWidth="2" />
      </g>

      <g opacity="0.8">
        <path d="M118 956C188 902 236 876 300 870C368 864 414 884 450 912C504 952 570 970 642 952C718 932 778 886 860 874C846 958 778 1030 698 1070C612 1112 520 1124 424 1114C328 1104 238 1070 174 1020C138 992 126 972 118 956Z" fill="#2F4633" opacity="0.62" />
        <ellipse cx="138" cy="1094" rx="176" ry="98" fill="url(#moss-glow)" />
        <ellipse cx="760" cy="1090" rx="190" ry="110" fill="url(#moss-glow)" />
      </g>

      <g opacity="0.78">
        {[
          [110, 1084, 44, 24], [170, 1044, 38, 20], [238, 1088, 44, 22], [760, 1084, 42, 24], [820, 1042, 36, 18], [690, 1088, 46, 24],
          [182, 1188, 52, 24], [724, 1184, 50, 24]
        ].map(([cx, cy, rx, ry], index) => (
          <ellipse key={`stone-${index}`} cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#stone-shade)" />
        ))}
      </g>

      <g className="title-svg-lanterns">
        {stoneLanterns.map((lantern, index) => (
          <g key={`lantern-${index}`} transform={`translate(${lantern.x} ${lantern.y})`}>
            <ellipse cx="22" cy="74" rx="64" ry="74" fill="url(#lantern-glow)" filter="url(#garden-medium-blur)" />
            <rect x="18" y="48" width="8" height="54" rx="4" fill="#4D4138" />
            <rect x="6" y="20" width="32" height="26" rx="10" fill="#6A625C" />
            <ellipse cx="22" cy="34" rx="13" ry="12" fill="url(#lantern-core)" />
            <ellipse cx="22" cy="12" rx="18" ry="8" fill="#766F69" />
          </g>
        ))}
      </g>

      <g opacity="0.92">
        <path d="M88 882L236 750L314 816L184 962L88 882Z" fill="#4B372B" />
        <path d="M110 886L232 780L284 824L178 948L110 886Z" fill="#82604A" opacity="0.7" />
        <path d="M124 900L238 802M144 926L256 826M166 952L274 848" stroke="#E6B786" strokeLinecap="round" strokeWidth="6" opacity="0.16" />
      </g>

      <g className="title-svg-dock">
        <path d="M420 1264H480L522 1560H378L420 1264Z" fill="url(#dock-wood)" opacity="0.98" />
        <path d="M430 1272L444 1552M450 1270V1554M470 1274L458 1550" stroke="#DDA87A" strokeWidth="4" opacity="0.28" />
      </g>

      <g opacity="0.34" filter="url(#garden-medium-blur)">
        <path d="M234 666C318 650 372 658 450 694C522 728 586 736 662 714" stroke="#FFD3A7" strokeLinecap="round" strokeWidth="16" />
        <path d="M282 744C338 732 392 738 450 760C510 782 566 784 622 770" stroke="#F4D6B7" strokeLinecap="round" strokeWidth="14" />
      </g>

      <g opacity="0.88" filter="url(#garden-soft-blur)">
        <ellipse cx="450" cy="744" rx="220" ry="108" fill="#0E131C" />
        <ellipse cx="450" cy="738" rx="174" ry="74" fill="url(#title-clearing)" />
      </g>

      <g className="title-svg-branches">
        <path d="M-42 170C80 196 176 258 278 338C348 394 408 430 470 454" stroke="url(#tree-bark)" strokeLinecap="round" strokeWidth="28" />
        <path d="M956 156C846 212 748 280 648 366C586 420 522 462 460 498" stroke="url(#tree-bark)" strokeLinecap="round" strokeWidth="30" />
        <path d="M-8 1094C76 1014 142 962 248 930C330 906 398 902 472 920" stroke="url(#tree-bark)" strokeLinecap="round" strokeWidth="30" />
        <path d="M920 1060C834 992 758 944 656 922C574 902 512 900 446 916" stroke="url(#tree-bark)" strokeLinecap="round" strokeWidth="28" />
        <path d="M128 64C274 84 384 100 552 112C692 122 794 132 912 170" stroke="url(#tree-bark)" strokeLinecap="round" strokeWidth="18" />
      </g>

      <g className="title-svg-blossoms">
        {blossomClusters.map((cluster, index) => (
          <g key={`cluster-${index}`} opacity="0.98">
            <circle cx={cluster.x} cy={cluster.y} r={cluster.r} fill="url(#blossom-petal)" />
            <circle cx={cluster.x - cluster.r * 0.58} cy={cluster.y + cluster.r * 0.22} r={cluster.r * 0.64} fill="url(#blossom-petal)" />
            <circle cx={cluster.x + cluster.r * 0.52} cy={cluster.y - cluster.r * 0.14} r={cluster.r * 0.6} fill="url(#blossom-petal)" />
          </g>
        ))}
        {floatingPetals.map((petal, index) => (
          <ellipse
            key={`petal-${index}`}
            cx={petal.x}
            cy={petal.y}
            rx={petal.w / 2}
            ry={petal.h / 2}
            fill="#F3C4D8"
            opacity="0.82"
            transform={`rotate(${petal.rotate} ${petal.x} ${petal.y})`}
          />
        ))}
      </g>

      <g className="title-svg-koi">
        {koiFish.map((fish, index) => (
          <g key={`koi-${index}`} className={`title-svg-koi-${["one", "two", "three"][index]}`}>
            <ellipse cx={fish.x} cy={fish.y} rx={fish.rx} ry={fish.ry} fill={fish.fill} />
            <path d={`M${fish.x + fish.rx - 6} ${fish.y}L${fish.x + fish.rx + 18} ${fish.y - 10}V${fish.y + 10}L${fish.x + fish.rx - 6} ${fish.y}Z`} fill={fish.tail} />
          </g>
        ))}
      </g>

      <circle cx="540" cy="672" r="14" fill="url(#green-light)" />
      <rect x="537" y="688" width="6" height="166" rx="3" fill="#8EED90" opacity="0.18" filter="url(#garden-medium-blur)" />

      <g filter="url(#garden-soft-blur)" opacity="0.7">
        <ellipse cx="450" cy="1464" rx="432" ry="104" fill="#10151B" />
        <ellipse cx="450" cy="958" rx="316" ry="52" fill="#101721" />
      </g>
    </svg>
  );
}
