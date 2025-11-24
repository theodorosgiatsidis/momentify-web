import toast from 'react-hot-toast';
import { createElement } from 'react';

// Simple toast helper functions (no JSX, can be .ts file)
export const showSuccessToast = (message: string) => {
  return toast.success(message, {
    duration: 3000,
    position: 'top-center',
    style: {
      background: '#10b981',
      color: '#fff',
      fontWeight: '600',
      borderRadius: '12px',
      padding: '16px 24px',
    },
    icon: '✓',
  });
};

export const showErrorToast = (message: string) => {
  return toast.error(message, {
    duration: 4000,
    position: 'top-center',
    style: {
      background: '#ef4444',
      color: '#fff',
      fontWeight: '600',
      borderRadius: '12px',
      padding: '16px 24px',
    },
    icon: '✕',
  });
};

export const showInfoToast = (message: string) => {
  return toast(message, {
    duration: 3000,
    position: 'top-center',
    style: {
      background: '#6366f1',
      color: '#fff',
      fontWeight: '600',
      borderRadius: '12px',
      padding: '16px 24px',
    },
    icon: 'ℹ️',
  });
};

export const showLoadingToast = (message: string) => {
  return toast.loading(message, {
    position: 'top-center',
    style: {
      background: '#8b5cf6',
      color: '#fff',
      fontWeight: '600',
      borderRadius: '12px',
      padding: '16px 24px',
    },
  });
};

// Live update toast with custom rendering
export const showLiveUpdateToast = (message: string, photoUrl?: string) => {
  return toast.custom(
    (t) => {
      return createElement(
        'div',
        {
          className: `${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden`,
        },
        photoUrl &&
          createElement(
            'div',
            { className: 'flex-shrink-0 w-20 h-20' },
            createElement('img', {
              src: photoUrl,
              alt: 'New upload',
              className: 'w-full h-full object-cover',
            })
          ),
        createElement(
          'div',
          { className: 'flex-1 p-4' },
          createElement(
            'div',
            { className: 'flex items-start' },
            createElement(
              'div',
              { className: 'flex-shrink-0' },
              createElement(
                'svg',
                {
                  className: 'h-6 w-6 text-indigo-600',
                  fill: 'none',
                  viewBox: '0 0 24 24',
                  stroke: 'currentColor',
                },
                createElement('path', {
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  strokeWidth: 2,
                  d: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
                })
              )
            ),
            createElement(
              'div',
              { className: 'ml-3 flex-1' },
              createElement('p', { className: 'text-sm font-semibold text-gray-900' }, message)
            ),
            createElement(
              'div',
              { className: 'ml-4 flex-shrink-0 flex' },
              createElement(
                'button',
                {
                  onClick: () => toast.dismiss(t.id),
                  className: 'inline-flex text-gray-400 hover:text-gray-500 focus:outline-none',
                },
                createElement('span', { className: 'sr-only' }, 'Close'),
                createElement(
                  'svg',
                  { className: 'h-5 w-5', viewBox: '0 0 20 20', fill: 'currentColor' },
                  createElement('path', {
                    fillRule: 'evenodd',
                    d: 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z',
                    clipRule: 'evenodd',
                  })
                )
              )
            )
          )
        )
      );
    },
    { duration: 5000, position: 'top-center' }
  );
};
