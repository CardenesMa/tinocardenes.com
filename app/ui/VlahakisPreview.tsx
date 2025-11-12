import styles from './VlahakisPreview.module.css';
import { serif } from './fonts';

const videos = [
  'https://www.youtube.com/embed/z1hGBjZeRz0?si=FP9UI2or-gaPvKrW',
  'https://www.youtube.com/embed/4eYuc9c5NaY?si=pBg-dM5RqD7w5VJs',
  'https://www.youtube.com/embed/VnlUzmmqrGg?si=q-UDafTx_bkhgIWf',
];

const VlahakisPreview = () => {
  return (
    <div className={` ${styles.previewContainer} ${serif.className}`}>
      <div className={styles.strip}>
        <h1 className={styles.topTitle}>Here's a preview of</h1>
        <h2 className={styles.sessionTitle}>The Vlahakis Sessions</h2>

      <div className={styles.videoRow}>
        {videos.map((src, idx) => (
          <iframe
            key={idx}
            className={styles.videoWrapper}
            width="100%"
            height="100%"
            src={src}
            title={`YouTube video player ${idx+1}`}
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        ))}
      </div>
      </div>
    </div>
  );
};

export default VlahakisPreview;
