import { Cormorant_Garamond } from 'next/font/google';
import localFont from 'next/font/local';

export const nameBigFont = localFont({
    src: [
        {
            path: './Futura LT Book Regular.otf',
            weight: '400',
            style: 'normal',
        },
    ],

    display: 'swap',
});
export const serif = Cormorant_Garamond({ subsets: ['latin'] });
export const sans = nameBigFont;