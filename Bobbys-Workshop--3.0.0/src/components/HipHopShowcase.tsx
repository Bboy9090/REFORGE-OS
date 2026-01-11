/**
 * Bobby's Workshop - Hip-Hop Aesthetic Demo Component
 * Showcase of 90s/00s visual elements and sound effects
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { soundManager, useSoundEffect } from '@/lib/soundManager';

export function HipHopShowcase() {
  const [selectedColorway, setSelectedColorway] = useState<string>('bred');
  const playKick = useSoundEffect('boom-bap-kick');
  const playScratch = useSoundEffect('vinyl-scratch');
  const playClick = useSoundEffect('cassette-click');

  const colorways = [
    { name: 'Bred', class: 'jordan-bred', color: 'Black/Red' },
    { name: 'Royal', class: 'jordan-royal', color: 'Black/Blue' },
    { name: 'Chicago', class: 'jordan-chicago', color: 'White/Red/Black' },
    { name: 'Concord', class: 'jordan-concord', color: 'White/Purple' },
    { name: 'Space Jam', class: 'jordan-spacejam', color: 'Black/Blue' },
    { name: 'Cement', class: 'jordan-cement', color: 'Grey/Red' },
  ];

  return (
    <div className="workshop-bg min-h-screen p-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="street-sign-text text-6xl">Bobby's Workshop</h1>
          <p className="boom-bap-text text-xl">90s/00s Hip-Hop Aesthetic Demo</p>
        </div>

        {/* Baseball Card Style */}
        <Card className="baseball-card max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-black font-bold">
              Device #001
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-linear-to-br from-gray-200 to-gray-400 rounded flex items-center justify-center">
              <span className="text-4xl">📱</span>
            </div>
            <div className="baseball-card-stats space-y-1">
              <div className="flex justify-between">
                <span>Model:</span>
                <span>Galaxy S23</span>
              </div>
              <div className="flex justify-between">
                <span>OS:</span>
                <span>Android 14</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span>Connected</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CD Jewel Case Effect */}
        <Card className="cd-jewel-case max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-white text-center">
              Greatest Hits Vol. 1
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="cd-disc-shine aspect-square rounded-full mx-auto max-w-xs" />
            <p className="text-white text-center mt-4 text-sm">
              Now Playing: Boom Bap Instrumentals
            </p>
          </CardContent>
        </Card>

        {/* Air Jordan Colorways */}
        <div className="boom-bap-panel p-6 rounded-lg space-y-4">
          <h2 className="boom-bap-text text-2xl text-center">
            Air Jordan Colorways
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {colorways.map((colorway) => (
              <button
                key={colorway.name}
                className={`${colorway.class} p-4 rounded-lg transition-transform hover:scale-105`}
                onClick={() => {
                  playClick();
                  setSelectedColorway(colorway.name.toLowerCase());
                }}
              >
                <div className="text-center space-y-1">
                  <div className="font-bold">{colorway.name}</div>
                  <div className="text-xs opacity-80">{colorway.color}</div>
                </div>
              </button>
            ))}
          </div>
          {selectedColorway && (
            <div className="text-center">
              <Badge className="boom-bap-text">
                Selected: {selectedColorway}
              </Badge>
            </div>
          )}
        </div>

        {/* Cassette Tape Style */}
        <Card className="cassette-tape max-w-md mx-auto h-32">
          <CardContent className="h-full flex items-center justify-center">
            <div className="text-center text-white">
              <p className="boom-bap-text text-lg">Side A</p>
              <p className="text-sm opacity-70">Boom Bap Classics</p>
            </div>
          </CardContent>
        </Card>

        {/* Vinyl Record */}
        <div className="vinyl-groove aspect-square max-w-xs mx-auto" />

        {/* Boombox Speaker Grill */}
        <Card className="speaker-grill p-8 max-w-md mx-auto">
          <CardContent>
            <div className="text-center space-y-4">
              <h3 className="boom-bap-text text-xl">Audio Output</h3>
              <div className="flex gap-4 justify-center">
                <div className="status-led connected" />
                <div className="status-led connected" />
                <div className="status-led connected" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sound Effects Demo */}
        <div className="boom-bap-panel p-6 rounded-lg space-y-4">
          <h2 className="boom-bap-text text-2xl text-center">
            Sound Effects Demo
          </h2>
          <p className="text-center text-gray-400 text-sm">
            Note: Sound files must be placed in public/sounds/ directory
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              className="boom-bap-button"
              onClick={() => soundManager.play('boom-bap-kick')}
            >
              🥁 Kick Drum
            </Button>
            <Button
              className="boom-bap-button"
              onClick={() => soundManager.play('vinyl-scratch')}
            >
              💿 Vinyl Scratch
            </Button>
            <Button
              className="boom-bap-button"
              onClick={() => soundManager.play('cassette-click')}
            >
              📼 Cassette Click
            </Button>
            <Button
              className="boom-bap-button"
              onClick={() => soundManager.play('air-horn')}
            >
              📯 Air Horn
            </Button>
            <Button
              className="boom-bap-button"
              onClick={() => soundManager.play('basketball-bounce')}
            >
              🏀 Ball Bounce
            </Button>
            <Button
              className="boom-bap-button"
              onClick={() => soundManager.play('spray-can')}
            >
              🎨 Spray Can
            </Button>
          </div>
        </div>

        {/* Sneaker Button Styles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="btn-sneaker" onClick={playKick}>
            Primary Action
          </Button>
          <Button className="boom-bap-button" onClick={playClick}>
            Secondary Action
          </Button>
          <Button className="jordan-bred p-4" onClick={playKick}>
            Bred Style
          </Button>
          <Button className="jordan-royal p-4" onClick={playClick}>
            Royal Style
          </Button>
        </div>

        {/* Status Indicators */}
        <div className="sneaker-box-card p-6 space-y-4">
          <h3 className="street-sign-text text-center">Status LEDs</h3>
          <div className="flex gap-8 justify-center items-center">
            <div className="text-center space-y-2">
              <div className="status-led connected mx-auto" />
              <p className="console-text text-xs">Connected</p>
            </div>
            <div className="text-center space-y-2">
              <div className="status-led error mx-auto" />
              <p className="console-text text-xs">Error</p>
            </div>
            <div className="text-center space-y-2">
              <div className="status-led disconnected mx-auto" />
              <p className="console-text text-xs">Offline</p>
            </div>
          </div>
        </div>

        {/* PlayStation Colors */}
        <div className="floor-grid p-6 rounded-lg">
          <h3 className="street-sign-text text-center mb-4">
            PlayStation Button Colors
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="ps-triangle text-5xl">▲</div>
              <p className="text-sm text-gray-400">Triangle (Success)</p>
            </div>
            <div className="text-center space-y-2">
              <div className="ps-circle text-5xl">●</div>
              <p className="text-sm text-gray-400">Circle (Cancel)</p>
            </div>
            <div className="text-center space-y-2">
              <div className="ps-x text-5xl">✕</div>
              <p className="text-sm text-gray-400">X (Confirm)</p>
            </div>
            <div className="text-center space-y-2">
              <div className="ps-square text-5xl">■</div>
              <p className="text-sm text-gray-400">Square (Special)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
