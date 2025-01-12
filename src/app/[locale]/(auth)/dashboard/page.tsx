'use client';

import { useUser } from '@clerk/nextjs';
// import { useLocale } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';

const ENCART_TEMPLATES = [
  {
    id: 'encart-discord',
    label: 'Discord Encart',
    width: 200,
    height: 80,
    background: '#6441A5',
  },
  {
    id: 'encart-sponsor',
    label: 'Sponsor Banner',
    width: 300,
    height: 100,
    background: '#ff9900',
  },
];

type EncartItem = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  background: string;
  fileUrl?: string;
  text?: string;
  linkUrl?: string;
  entryAnimation?: string;
  exitAnimation?: string;
  entryAnimationDuration?: number;
  exitAnimationDuration?: number;
  delayBetweenAppearances?: number;
  displayDuration?: number;
  referenceResolution?: { // Ajout de la propriété referenceResolution
    width: number;
    height: number;
  };
};

export default function DashboardIndexPage() {
  // const t = useTranslations('DashboardIndex');
  // const locale = useLocale();
  const { user, isLoaded, isSignedIn } = useUser();

  const [encarts, setEncarts] = useState<EncartItem[]>([]);
  const [initialEncarts, setInitialEncarts] = useState<EncartItem[]>([]);
  const [selectedEncartId, setSelectedEncartId] = useState<string | null>(null);
  const [twitchChannel, setTwitchChannel] = useState<string>('');

  useEffect(() => {
    const fetchEncarts = async () => {
      const response = await fetch('/api/encarts');
      const data = await response.json();
      setEncarts(data.data);
      setInitialEncarts(data.data); // Save the initial state for tracking changes
    };

    fetchEncarts();
  }, []);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in to view your dashboard</div>;
  }

  const addEncart = async (template: typeof ENCART_TEMPLATES[number]) => {
    const newItem: Omit<EncartItem, 'id'> = {
      label: template.label,
      x: 50,
      y: 50,
      width: template.width,
      height: template.height,
      background: template.background,
      referenceResolution: { width: window.innerWidth, height: window.innerHeight }, // Sauvegarde la résolution actuelle
    };

    const response = await fetch('/api/encarts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...newItem, userId: user?.id }),
    });

    const data = await response.json();
    if (data.success) {
      const newEncart = { ...newItem, id: data.data.id };
      setEncarts(prev => [...prev, newEncart]);
      setInitialEncarts(prev => [...prev, newEncart]);
      setSelectedEncartId(data.data.id);
    } else {
      console.error('Failed to add encart:', data.error);
    }
  };

  const removeEncart = (encartId: string) => {
    setEncarts(prev => prev.filter(e => e.id !== encartId));
    if (selectedEncartId === encartId) {
      setSelectedEncartId(null);
    }
  };

  const updateEncart = (id: string, newProps: Partial<EncartItem>) => {
    setEncarts(prev =>
      prev.map(e => (e.id === id ? { ...e, ...newProps } : e)),
    );
  };

  const handleUpdateConfig = (field: keyof EncartItem, value: any) => {
    if (!selectedEncart) {
      return;
    }
    updateEncart(selectedEncart.id, { [field]: value });
  };

  const saveEncartSettings = async () => {
    if (!user) {
      console.error('User is not authenticated');
      return;
    }

    const userId = user.id;

    const toInsert = encarts.filter(encart =>
      initialEncarts.every(e => e.id !== encart.id),
    );
    const toUpdate = encarts.filter(encart =>
      initialEncarts.some(
        e =>
          e.id === encart.id
          && (e.label !== encart.label
            || e.x !== encart.x
            || e.y !== encart.y
            || e.width !== encart.width
            || e.height !== encart.height
            || e.background !== encart.background
            || e.fileUrl !== encart.fileUrl
            || e.text !== encart.text
            || e.linkUrl !== encart.linkUrl
            || e.entryAnimation !== encart.entryAnimation
            || e.exitAnimation !== encart.exitAnimation),
      ),
    );
    const toDelete = initialEncarts.filter(encart =>
      encarts.every(e => e.id !== encart.id),
    );

    if (toInsert.length > 0) {
      await Promise.all(
        toInsert.map(async (encart) => {
          const response = await fetch('/api/encarts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...encart, userId }),
          });

          const data = await response.json();
          if (!data.success) {
            console.error('Failed to insert encart:', encart);
          }
        }),
      );
    }

    if (toUpdate.length > 0) {
      await Promise.all(
        toUpdate.map(async (encart) => {
          const response = await fetch(`/api/encarts/${encart.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...encart, userId }),
          });

          const data = await response.json();
          if (!data.success) {
            console.error('Failed to update encart:', encart);
          }
        }),
      );
    }

    if (toDelete.length > 0) {
      await Promise.all(
        toDelete.map(async (encart) => {
          const response = await fetch(`/api/encarts/${encart.id}`, {
            method: 'DELETE',
          });

          const data = await response.json();
          if (!data.success) {
            console.error('Failed to delete encart:', encart);
          }
        }),
      );
    }

    console.log('Changes saved successfully');

    const response = await fetch('/api/encarts');
    const data = await response.json();
    setEncarts(data.data);
    setInitialEncarts(data.data);
  };
  // console
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.fileUrl) {
        handleUpdateConfig('fileUrl', data.fileUrl);
      }
    }
  };

  const playAnimation = (type: 'entry' | 'exit') => {
    if (!selectedEncartId || !selectedEncart) {
      return;
    }

    const animationClass
      = type === 'entry' ? selectedEncart.entryAnimation : selectedEncart.exitAnimation;
    const duration
      = type === 'entry'
        ? selectedEncart.entryAnimationDuration || 1000
        : selectedEncart.exitAnimationDuration || 1000;

    if (!animationClass) {
      return;
    }

    const encartElement = document.getElementById(selectedEncartId);

    if (encartElement) {
      encartElement.style.animation = 'none';

      const currentTransform = getComputedStyle(encartElement).transform;

      const keyframes = ({
        // Default animations
        'animate-fade-in': '0% { opacity: 0; } 100% { opacity: 1; }',
        'animate-fade-out': '0% { opacity: 1; } 100% { opacity: 0; }',

        'animate-slide-in-top': `
          0% { transform: ${currentTransform} translateY(-20px); opacity: 0; }
          100% { transform: ${currentTransform} translateY(0); opacity: 1; }
        `,
        'animate-slide-out-top': `
          0% { transform: ${currentTransform} translateY(0); opacity: 1; }
          100% { transform: ${currentTransform} translateY(-20px); opacity: 0; }
        `,

        'animate-slide-in-bottom': `
          0% { transform: ${currentTransform} translateY(20px); opacity: 0; }
          100% { transform: ${currentTransform} translateY(0); opacity: 1; }
        `,
        'animate-slide-out-bottom': `
          0% { transform: ${currentTransform} translateY(0); opacity: 1; }
          100% { transform: ${currentTransform} translateY(20px); opacity: 0; }
        `,

        'animate-slide-in-left': `
          0% { transform: ${currentTransform} translateX(-20px); opacity: 0; }
          100% { transform: ${currentTransform} translateX(0); opacity: 1; }
        `,
        'animate-slide-out-left': `
          0% { transform: ${currentTransform} translateX(0); opacity: 1; }
          100% { transform: ${currentTransform} translateX(-20px); opacity: 0; }
        `,

        'animate-slide-in-right': `
          0% { transform: ${currentTransform} translateX(20px); opacity: 0; }
          100% { transform: ${currentTransform} translateX(0); opacity: 1; }
        `,
        'animate-slide-out-right': `
          0% { transform: ${currentTransform} translateX(0); opacity: 1; }
          100% { transform: ${currentTransform} translateX(20px); opacity: 0; }
        `,

        'animate-zoom-in': `
          0% { transform: ${currentTransform} scale(0.8); opacity: 0; }
          100% { transform: ${currentTransform} scale(1); opacity: 1; }
        `,
        'animate-zoom-out': `
          0% { transform: ${currentTransform} scale(1); opacity: 1; }
          100% { transform: ${currentTransform} scale(0.8); opacity: 0; }
        `,

        'animate-rotate-90': `
          0% { transform: ${currentTransform} rotate(0deg); opacity: 1; }
          100% { transform: ${currentTransform} rotate(90deg); opacity: 1; }
        `,
        'animate-rotate-180': `
          0% { transform: ${currentTransform} rotate(0deg); opacity: 1; }
          100% { transform: ${currentTransform} rotate(180deg); opacity: 1; }
        `,
        'animate-rotate-360': `
          0% { transform: ${currentTransform} rotate(0deg); opacity: 1; }
          100% { transform: ${currentTransform} rotate(360deg); opacity: 1; }
        `,

        'animate-flip-horizontal': `
          0% { transform: ${currentTransform} scaleX(1); }
          100% { transform: ${currentTransform} scaleX(-1); }
        `,
        'animate-flip-vertical': `
          0% { transform: ${currentTransform} scaleY(1); }
          100% { transform: ${currentTransform} scaleY(-1); }
        `,

        'animate-bouncing': `
          0%, 100% { transform: ${currentTransform} translateY(0); }
          50% { transform: ${currentTransform} translateY(-10px); }
        `,

        'animate-swing': `
          0%, 100% { transform: ${currentTransform} rotate(0deg); }
          25% { transform: ${currentTransform} rotate(15deg); }
          75% { transform: ${currentTransform} rotate(-15deg); }
        `,

        'animate-wobble': `
          0%, 100% { transform: ${currentTransform} translateX(0); }
          25% { transform: ${currentTransform} translateX(-5px); }
          75% { transform: ${currentTransform} translateX(5px); }
        `,

        'animate-pulsing': `
          0%, 100% { transform: ${currentTransform} scale(1); }
          50% { transform: ${currentTransform} scale(1.1); }
        `,

        'animate-shake': `
          0%, 100% { transform: ${currentTransform} translateX(0); }
          25%, 75% { transform: ${currentTransform} translateX(-5px); }
          50% { transform: ${currentTransform} translateX(5px); }
        `,

        'animate-tada': `
          0% { transform: ${currentTransform} scale(1); }
          10%, 20% { transform: ${currentTransform} scale(0.9) rotate(-3deg); }
          30%, 50%, 70%, 90% { transform: ${currentTransform} scale(1.1) rotate(3deg); }
          40%, 60%, 80% { transform: ${currentTransform} scale(1.1) rotate(-3deg); }
          100% { transform: ${currentTransform} scale(1) rotate(0); }
        `,

        'animate-jump': `
          0%, 100% { transform: ${currentTransform} translateY(0); }
          50% { transform: ${currentTransform} translateY(-20px); }
        `,

        'animate-hang': `
          0% { transform: ${currentTransform} rotate(0deg); }
          100% { transform: ${currentTransform} rotate(180deg); }
        `,

        'animate-roll-in': `
          0% { transform: ${currentTransform} translateX(-100%) rotate(-120deg); opacity: 0; }
          100% { transform: ${currentTransform} translateX(0) rotate(0deg); opacity: 1; }
        `,
        'animate-roll-out': `
          0% { transform: ${currentTransform} translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: ${currentTransform} translateX(100%) rotate(120deg); opacity: 0; }
        `,

        'animate-float': `
          0%, 100% { transform: ${currentTransform} translateY(0); }
          50% { transform: ${currentTransform} translateY(-10px); }
        `,

        'animate-sink': `
          0%, 100% { transform: ${currentTransform} translateY(0); }
          50% { transform: ${currentTransform} translateY(10px); }
        `,

        'animate-flash': `
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        `,

        'animate-jiggle': `
          0%, 100% { transform: ${currentTransform} rotate(0deg); }
          25% { transform: ${currentTransform} rotate(5deg); }
          75% { transform: ${currentTransform} rotate(-5deg); }
        `,

        'animate-rubber-band': `
          0% { transform: ${currentTransform} scale(1); }
          30% { transform: ${currentTransform} scaleX(1.25) scaleY(0.75); }
          40% { transform: ${currentTransform} scaleX(0.75) scaleY(1.25); }
          50% { transform: ${currentTransform} scale(1.15); }
          65% { transform: ${currentTransform} scale(0.95); }
          75% { transform: ${currentTransform} scale(1.05); }
          100% { transform: ${currentTransform} scale(1); }
        `,

        'animate-scale': `
          0% { transform: ${currentTransform} scale(0); }
          100% { transform: ${currentTransform} scale(1); }
        `,

        // Add remaining keyframes similarly...

      });

      const keyframeAnimation = keyframes[animationClass as keyof typeof keyframes];

      if (keyframeAnimation) {
        const styleSheet = document.createElement('style');
        styleSheet.type = 'text/css';
        const animationName = `custom-${animationClass}-${Date.now()}`;
        styleSheet.innerHTML = `
          @keyframes ${animationName} {
            ${keyframeAnimation}
          }
        `;
        document.head.appendChild(styleSheet);

        encartElement.style.animation = `${animationName} ${duration}ms ease forwards`;

        setTimeout(() => {
          document.head.removeChild(styleSheet);
        }, duration);
      }
    }
  };

  const selectedEncart = encarts.find(e => e.id === selectedEncartId);
  const twitchEmbedUrl = `https://player.twitch.tv/?channel=${twitchChannel}&parent=clickable-assets-twitch.vercel.app&muted=true`;

  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      {/* Ensure Tailwind includes these animation classes */}
      <div className="hidden">
        animate-fade-in animate-slide-in-bottom animate-zoom-in
        animate-fade-out animate-slide-out-bottom animate-zoom-out
      </div>

      <div className="flex w-56 shrink-0 flex-col space-y-4 border-r border-gray-300 bg-white p-4">
        <h2 className="mb-4 text-xl font-semibold">Toolbox</h2>

        <div className="flex flex-col gap-2">
          {ENCART_TEMPLATES.map(template => (
            <button
              key={template.id}
              onClick={() => addEncart(template)}
              className="rounded-md bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700"
            >
              {template.label}
            </button>
          ))}
        </div>

        <hr className="my-4" />

        <div>
          <label className="block font-medium">Twitch Channel URL:</label>
          <input
            type="text"
            className="w-full rounded-md border px-3 py-2"
            placeholder="Enter Twitch channel name"
            value={twitchChannel}
            onChange={e => setTwitchChannel(e.target.value)}
          />
        </div>

        <hr className="my-4" />

        {selectedEncart
          ? (
              <div className="space-y-2 text-sm">
                <h3 className="font-bold text-gray-700">
                  Edit:
                  {' '}
                  {selectedEncart.label}
                </h3>

                <div>
                  <label className="block font-medium">Label:</label>
                  <input
                    className="w-full rounded border px-2 py-1"
                    type="text"
                    value={selectedEncart.label}
                    onChange={e => handleUpdateConfig('label', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-medium">Background:</label>
                  <input
                    className="w-full rounded border px-2 py-1"
                    type="color"
                    value={selectedEncart.background}
                    onChange={e => handleUpdateConfig('background', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-medium">Entry Animation:</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedEncart?.entryAnimation || ''}
                      onChange={e => handleUpdateConfig('entryAnimation', e.target.value)}
                      className="w-full rounded border px-2 py-1"
                    >
                      <option value="">None</option>
                      <option value="animate-blurred-fade-in">Blurred Fade In</option>
                      <option value="animate-fade-in">Fade In</option>
                      <option value="animate-fade-out">Fade Out</option>
                      <option value="animate-slide-in-top">Slide In Top</option>
                      <option value="animate-slide-in-bottom">Slide In Bottom</option>
                      <option value="animate-slide-out-top">Slide Out Top</option>
                      <option value="animate-slide-out-bottom">Slide Out Bottom</option>
                      <option value="animate-zoom-in">Zoom In</option>
                      <option value="animate-zoom-out">Zoom Out</option>
                      <option value="animate-rotate-90">Rotate 90</option>
                      <option value="animate-rotate-180">Rotate 180</option>
                      <option value="animate-rotate-360">Rotate 360</option>
                      <option value="animate-flip-horizontal">Flip Horizontal</option>
                      <option value="animate-flip-vertical">Flip Vertical</option>
                      <option value="animate-bouncing">Bouncing</option>
                      <option value="animate-swing">Swing</option>
                      <option value="animate-wobble">Wobble</option>
                      <option value="animate-pulsing">Pulsing</option>
                      <option value="animate-shake">Shake</option>
                      <option value="animate-tada">Tada</option>
                      <option value="animate-jump">Jump</option>
                      <option value="animate-hang">Hang</option>
                      <option value="animate-roll-in">Roll In</option>
                      <option value="animate-roll-out">Roll Out</option>
                      <option value="animate-float">Float</option>
                      <option value="animate-sink">Sink</option>
                      <option value="animate-flash">Flash</option>
                      <option value="animate-jiggle">Jiggle</option>
                      <option value="animate-rubber-band">Rubber Band</option>
                      <option value="animate-scale">Scale</option>
                      <option value="animate-slide-in-left">Slide In Left</option>
                      <option value="animate-slide-in-right">Slide In Right</option>
                      <option value="animate-slide-out-left">Slide Out Left</option>
                      <option value="animate-slide-out-right">Slide Out Right</option>
                      <option value="animate-spin-clockwise">Spin Clockwise</option>
                      <option value="animate-spin-counter-clockwise">Spin Counter Clockwise</option>
                      <option value="animate-flip-x">Flip X</option>
                      <option value="animate-flip-y">Flip Y</option>
                      <option value="animate-blink">Blink</option>
                      <option value="animate-pop">Pop</option>
                      <option value="animate-expand-horizontally">Expand Horizontally</option>
                      <option value="animate-contract-horizontally">Contract Horizontally</option>
                      <option value="animate-expand-vertically">Expand Vertically</option>
                      <option value="animate-contract-vertically">Contract Vertically</option>
                      <option value="animate-fade-in-up">Fade In Up</option>
                      <option value="animate-fade-in-down">Fade In Down</option>
                      <option value="animate-fade-in-left">Fade In Left</option>
                      <option value="animate-fade-in-right">Fade In Right</option>
                      <option value="animate-fade-out-up">Fade Out Up</option>
                      <option value="animate-fade-out-down">Fade Out Down</option>
                      <option value="animate-fade-out-left">Fade Out Left</option>
                      <option value="animate-fade-out-right">Fade Out Right</option>
                      <option value="animate-sway">Sway</option>
                      <option value="animate-flip-in-x">Flip In X</option>
                      <option value="animate-flip-in-y">Flip In Y</option>
                      <option value="animate-flip-out-x">Flip Out X</option>
                      <option value="animate-flip-out-y">Flip Out Y</option>
                      <option value="animate-rotate-in">Rotate In</option>
                      <option value="animate-rotate-out">Rotate Out</option>
                      <option value="animate-slide-rotate-in">Slide Rotate In</option>
                      <option value="animate-slide-rotate-out">Slide Rotate Out</option>
                      <option value="animate-heartbeat">Heartbeat</option>
                      <option value="animate-horizontal-vibration">Horizontal Vibration</option>
                      <option value="animate-rotational-wave">Rotational Wave</option>
                      <option value="animate-skew">Skew</option>
                      <option value="animate-vertical-bounce">Vertical Bounce</option>
                      <option value="animate-horizontal-bounce">Horizontal Bounce</option>
                      <option value="animate-tilt">Tilt</option>
                      <option value="animate-squeeze">Squeeze</option>
                      <option value="animate-slide-up-fade">Slide Up Fade</option>
                      <option value="animate-bounce-fade-in">Bounce Fade In</option>
                      <option value="animate-swing-drop-in">Swing Drop In</option>
                      <option value="animate-pulse-fade-in">Pulse Fade In</option>
                      <option value="animate-impulse-rotation-right">Impulse Rotation Right</option>
                      <option value="animate-impulse-rotation-left">Impulse Rotation Left</option>
                      <option value="animate-dancing">Dancing</option>
                      <option value="animate-pulse">Pulse</option>
                      <option value="animate-jelly">Jelly</option>
                    </select>
                    <button
                      onClick={() => playAnimation('entry')}
                      className="rounded border bg-gray-200 p-1 hover:bg-gray-300"
                    >
                      <img src="/assets/images/play-button.svg" alt="Play" className="size-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-medium">Entry Animation Duration (ms):</label>
                  <input
                    type="number"
                    className="w-full rounded border px-2 py-1"
                    value={selectedEncart?.entryAnimationDuration || 1000}
                    onChange={e => handleUpdateConfig('entryAnimationDuration', Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block font-medium">Exit Animation:</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedEncart?.exitAnimation || ''}
                      onChange={e => handleUpdateConfig('exitAnimation', e.target.value)}
                      className="w-full rounded border px-2 py-1"
                    >
                      <option value="">None</option>
                      <option value="animate-blurred-fade-in">Blurred Fade In</option>
                      <option value="animate-fade-in">Fade In</option>
                      <option value="animate-fade-out">Fade Out</option>
                      <option value="animate-slide-in-top">Slide In Top</option>
                      <option value="animate-slide-in-bottom">Slide In Bottom</option>
                      <option value="animate-slide-out-top">Slide Out Top</option>
                      <option value="animate-slide-out-bottom">Slide Out Bottom</option>
                      <option value="animate-zoom-in">Zoom In</option>
                      <option value="animate-zoom-out">Zoom Out</option>
                      <option value="animate-rotate-90">Rotate 90</option>
                      <option value="animate-rotate-180">Rotate 180</option>
                      <option value="animate-rotate-360">Rotate 360</option>
                      <option value="animate-flip-horizontal">Flip Horizontal</option>
                      <option value="animate-flip-vertical">Flip Vertical</option>
                      <option value="animate-bouncing">Bouncing</option>
                      <option value="animate-swing">Swing</option>
                      <option value="animate-wobble">Wobble</option>
                      <option value="animate-pulsing">Pulsing</option>
                      <option value="animate-shake">Shake</option>
                      <option value="animate-tada">Tada</option>
                      <option value="animate-jump">Jump</option>
                      <option value="animate-hang">Hang</option>
                      <option value="animate-roll-in">Roll In</option>
                      <option value="animate-roll-out">Roll Out</option>
                      <option value="animate-float">Float</option>
                      <option value="animate-sink">Sink</option>
                      <option value="animate-flash">Flash</option>
                      <option value="animate-jiggle">Jiggle</option>
                      <option value="animate-rubber-band">Rubber Band</option>
                      <option value="animate-scale">Scale</option>
                      <option value="animate-slide-in-left">Slide In Left</option>
                      <option value="animate-slide-in-right">Slide In Right</option>
                      <option value="animate-slide-out-left">Slide Out Left</option>
                      <option value="animate-slide-out-right">Slide Out Right</option>
                      <option value="animate-spin-clockwise">Spin Clockwise</option>
                      <option value="animate-spin-counter-clockwise">Spin Counter Clockwise</option>
                      <option value="animate-flip-x">Flip X</option>
                      <option value="animate-flip-y">Flip Y</option>
                      <option value="animate-blink">Blink</option>
                      <option value="animate-pop">Pop</option>
                      <option value="animate-expand-horizontally">Expand Horizontally</option>
                      <option value="animate-contract-horizontally">Contract Horizontally</option>
                      <option value="animate-expand-vertically">Expand Vertically</option>
                      <option value="animate-contract-vertically">Contract Vertically</option>
                      <option value="animate-fade-in-up">Fade In Up</option>
                      <option value="animate-fade-in-down">Fade In Down</option>
                      <option value="animate-fade-in-left">Fade In Left</option>
                      <option value="animate-fade-in-right">Fade In Right</option>
                      <option value="animate-fade-out-up">Fade Out Up</option>
                      <option value="animate-fade-out-down">Fade Out Down</option>
                      <option value="animate-fade-out-left">Fade Out Left</option>
                      <option value="animate-fade-out-right">Fade Out Right</option>
                      <option value="animate-sway">Sway</option>
                      <option value="animate-flip-in-x">Flip In X</option>
                      <option value="animate-flip-in-y">Flip In Y</option>
                      <option value="animate-flip-out-x">Flip Out X</option>
                      <option value="animate-flip-out-y">Flip Out Y</option>
                      <option value="animate-rotate-in">Rotate In</option>
                      <option value="animate-rotate-out">Rotate Out</option>
                      <option value="animate-slide-rotate-in">Slide Rotate In</option>
                      <option value="animate-slide-rotate-out">Slide Rotate Out</option>
                      <option value="animate-heartbeat">Heartbeat</option>
                      <option value="animate-horizontal-vibration">Horizontal Vibration</option>
                      <option value="animate-rotational-wave">Rotational Wave</option>
                      <option value="animate-skew">Skew</option>
                      <option value="animate-vertical-bounce">Vertical Bounce</option>
                      <option value="animate-horizontal-bounce">Horizontal Bounce</option>
                      <option value="animate-tilt">Tilt</option>
                      <option value="animate-squeeze">Squeeze</option>
                      <option value="animate-slide-up-fade">Slide Up Fade</option>
                      <option value="animate-bounce-fade-in">Bounce Fade In</option>
                      <option value="animate-swing-drop-in">Swing Drop In</option>
                      <option value="animate-pulse-fade-in">Pulse Fade In</option>
                      <option value="animate-impulse-rotation-right">Impulse Rotation Right</option>
                      <option value="animate-impulse-rotation-left">Impulse Rotation Left</option>
                      <option value="animate-dancing">Dancing</option>
                      <option value="animate-pulse">Pulse</option>
                      <option value="animate-jelly">Jelly</option>
                    </select>
                    <button
                      onClick={() => playAnimation('exit')}
                      className="rounded border bg-gray-200 p-1 hover:bg-gray-300"
                    >
                      <img src="/assets/images/play-button.svg" alt="Play" className="size-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-medium">Exit Animation Duration (ms):</label>
                  <input
                    type="number"
                    className="w-full rounded border px-2 py-1"
                    value={selectedEncart?.exitAnimationDuration || 1000}
                    onChange={e => handleUpdateConfig('exitAnimationDuration', Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block font-medium">Exit Animation Duration (ms):</label>
                  <input
                    type="number"
                    className="w-full rounded border px-2 py-1"
                    value={selectedEncart?.exitAnimationDuration || 1000}
                    onChange={e => handleUpdateConfig('exitAnimationDuration', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block font-medium">Delay Between Appearances (ms):</label>
                  <input
                    type="number"
                    className="w-full rounded border px-2 py-1"
                    value={selectedEncart?.delayBetweenAppearances || 5000}
                    onChange={e => handleUpdateConfig('delayBetweenAppearances', Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block font-medium">Display Duration (ms):</label>
                  <input
                    type="number"
                    className="w-full rounded border px-2 py-1"
                    value={selectedEncart?.displayDuration || 3000}
                    onChange={e => handleUpdateConfig('displayDuration', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block font-medium">Image URL:</label>
                  <input
                    className="w-full rounded border px-2 py-1"
                    type="text"
                    value={selectedEncart.fileUrl || ''}
                    onChange={e => handleUpdateConfig('fileUrl', e.target.value)}
                  />
                  <input
                    type="file"
                    className="mt-2"
                    accept="image/png, image/jpeg, image/gif, image/jpg, video/mp4"
                    onChange={handleFileUpload}
                  />
                </div>

                <div>
                  <label className="block font-medium">Link URL:</label>
                  <input
                    className="w-full rounded border px-2 py-1"
                    type="text"
                    value={selectedEncart.linkUrl || ''}
                    onChange={e => handleUpdateConfig('linkUrl', e.target.value)}
                  />
                </div>

                <button
                  onClick={() => removeEncart(selectedEncart.id)}
                  className="mt-3 rounded-md bg-red-500 px-3 py-2 text-sm text-white transition hover:bg-red-600"
                >
                  Delete This Encart
                </button>
              </div>
            )
          : (
              <p className="mt-2 text-sm text-gray-500">Select an encart to edit</p>
            )}

        <button
          onClick={saveEncartSettings}
          className="mt-4 rounded-md bg-green-500 px-4 py-2 text-white"
        >
          Save Changes
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="relative h-[75vh] w-full max-w-6xl overflow-hidden rounded-md bg-gray-200 shadow-lg">
          <iframe
            title="Twitch Player"
            src={twitchEmbedUrl}
            allowFullScreen
            className="absolute left-0 top-0 size-full"
          />

          {encarts.map((encart) => {
            const isSelected = encart.id === selectedEncartId;
            return (
              <Rnd
                key={encart.id}
                id={encart.id} // Add unique ID for each encart
                default={{
                  x: encart.x,
                  y: encart.y,
                  width: encart.width,
                  height: encart.height,
                }}
                onDragStop={(_e, d) => {
                  updateEncart(encart.id, { x: d.x, y: d.y });
                }}
                onResizeStop={(_e, _dir, ref, _delta, pos) => {
                  updateEncart(encart.id, {
                    width: Number.parseFloat(ref.style.width),
                    height: Number.parseFloat(ref.style.height),
                    x: pos.x,
                    y: pos.y,
                  });
                }}
                style={{
                  border: isSelected ? '2px solid #00ff00' : '1px solid #999',
                  backgroundColor: encart.background,
                  backgroundImage: encart.fileUrl ? `url(${encart.fileUrl})` : undefined,
                  backgroundSize: 'cover',
                  color: '#fff',
                  cursor: 'move',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  animationDuration: '1s',
                }}
                bounds="parent"
                onClick={() => setSelectedEncartId(encart.id)}
              >
                {encart.text ?? encart.label}
              </Rnd>
            );
          })}
        </div>
      </div>
    </div>
  );
}
