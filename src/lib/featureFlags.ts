export const featureFlags = {
  experimentalToolbox: import.meta.env.VITE_EXPERIMENTAL_TOOLBOX === 'true',
  experimentalFlashing: import.meta.env.VITE_EXPERIMENTAL_FLASHING === 'true',
} as const;