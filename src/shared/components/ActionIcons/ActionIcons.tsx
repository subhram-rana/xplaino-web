import React from 'react';
import { FiTrash2, FiFolder } from 'react-icons/fi';
import styles from './ActionIcons.module.css';

export interface ActionIconsProps {
  onDelete: () => void;
  onMove: () => void;
  isVisible: boolean;
  className?: string;
  showMove?: boolean;
}

export const ActionIcons: React.FC<ActionIconsProps> = ({
  onDelete,
  onMove,
  isVisible,
  className = '',
  showMove = true,
}) => {
  return (
    <div className={`${styles.actionIcons} ${isVisible ? styles.visible : styles.hidden} ${className}`}>
      <button
        className={styles.deleteButton}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Delete"
        aria-label="Delete"
      >
        <FiTrash2 />
      </button>
      {showMove && (
        <button
          className={styles.moveButton}
          onClick={(e) => {
            e.stopPropagation();
            onMove();
          }}
          title="Move to folder"
          aria-label="Move to folder"
        >
          <FiFolder />
        </button>
      )}
    </div>
  );
};

ActionIcons.displayName = 'ActionIcons';

