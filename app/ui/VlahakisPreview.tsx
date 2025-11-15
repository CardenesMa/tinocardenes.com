import styles from './VlahakisPreview.module.css';
import { serif } from './fonts';
import YoutubePlayer from './YoutubePlayer';
const videos = [
  { title: "Harlem Nocturne", link: 'https://www.youtube.com/embed/z1hGBjZeRz0?si=FP9UI2or-gaPvKrW' },
  { title: "Wave", link: 'https://www.youtube.com/embed/4eYuc9c5NaY?si=pBg-dM5RqD7w5VJs' },
  { title: "Bach: Fugue in D# Minor", link: 'https://www.youtube.com/embed/VnlUzmmqrGg?si=q-UDafTx_bkhgIWf' },
];

const VlahakisPreview = () => {
  return (
    <div className={` ${styles.previewContainer} ${serif.className}`}>
      <div className={styles.strip}>
        <h1 className={styles.topTitle}>Here's a preview of</h1>
        <h2 className={styles.sessionTitle}>The Vlahakis Sessions</h2>

        <div className={styles.videoRow}>
          {videos.map((file, idx) => (
            <YoutubePlayer title={file.title} key={idx} link={file.link} size={300} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VlahakisPreview;
