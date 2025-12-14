import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Printer } from "lucide-react";

import GlassCard from '@components/GlassCard';
import styles from './Editor.module.css';
import EditorHelmet from './EditorHelmet';
import { printSVG } from '@utils/image-utils';
import Modal from '@components/Modal';
import Switch from '@components/Switch';

export default function Editor() {
  const { state } = useLocation();
  const { svg } = state || {};

  if (!svg) {
    return (
      <GlassCard className="text-center p-8">
        <h2>No SVG data found</h2>
        <p>Please upload an image first.</p>
      </GlassCard>
    );
  }

  const [isModalOpen, setModalOpen] = useState(false);

  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const toggleSwitch = () => setIsSwitchOn(prev => !prev);

  return (
    <>
      <EditorHelmet />

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Print Image">
        <div className="flex-center flex-column">
          <div
            className={isSwitchOn ? styles.emptyPathSvgContainer : undefined}
            id={styles.noEditSvgContainer}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <span>{isSwitchOn ? "Line Art" : "Normal"}</span>
          <Switch isOn={isSwitchOn} onToggle={toggleSwitch} />
          <button onClick={() => printSVG(svg, { lineArt: isSwitchOn })}>Print Image</button>
        </div>
      </Modal>

      <button onClick={() => setModalOpen(true)}><Printer size={24} /> Print</button>

      <GlassCard>
        <div
          className={`flex-center ${styles.svgContainer} ${styles.emptyPathSvgContainer}`}
          dangerouslySetInnerHTML={{ __html: svg }}
          onClick={(e) => {
            if (e.target.tagName === 'path') {
              e.target.id = styles.svgContainerColouredPath;
            }
          }}
        />
      </GlassCard>
    </>
  );
}
