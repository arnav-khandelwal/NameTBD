import React from "react";
import { IoClose, IoGameController } from "react-icons/io5";
import { MdPanTool } from "react-icons/md";
import { FaHandPaper } from "react-icons/fa";
import { GiHandOk } from "react-icons/gi";
import { HiArrowSmLeft, HiArrowSmRight } from "react-icons/hi";
import "./GameHelpModal.css";

export default function GameHelpModal({ onClose }) {
  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="help-modal-close" onClick={onClose}>
          <IoClose />
        </button>
        
        <h2 className="help-modal-title">
          <IoGameController style={{ marginRight: '10px', fontSize: '2.2rem' }} />
          HOW TO PLAY
        </h2>
        
        <div className="help-section">
          <h3 className="help-section-title">CONTROLS</h3>
          
          <div className="help-control-item">
            <div className="help-control-icon-group">
              <HiArrowSmLeft className="help-arrow" />
              <MdPanTool className="help-icon" />
              <HiArrowSmRight className="help-arrow" />
            </div>
            <div className="help-control-text">
              <strong>CAMERA:</strong> Move your open hand left/right to look around
            </div>
          </div>
          
          <div className="help-control-item">
            <div className="help-control-icon-group">
              <FaHandPaper className="help-icon" />
              <HiArrowSmRight className="help-arrow" />
              <GiHandOk className="help-icon" />
            </div>
            <div className="help-control-text">
              <strong>SHOOT:</strong> Pinch your fingers together to fire
            </div>
          </div>
        </div>
        
        <div className="help-section">
          <h3 className="help-section-title">ENEMIES & SCORING</h3>
          
          <div className="help-enemy-item">
            <div className="help-enemy-badge gremlin">
              <img src="/src/assets/enemy_sprites/gremlin.png" alt="Gremlin" className="help-enemy-img" />
            </div>
            <div className="help-enemy-details">
              <strong>Ghost</strong>
              <p>Damage: 5 HP | Shots to kill: 1</p>
              <p className="help-enemy-desc">Basic enemy, easy to defeat</p>
            </div>
          </div>
          
          <div className="help-enemy-item">
            <div className="help-enemy-badge ghost">
              <img src="/src/assets/enemy_sprites/ghostImg.png" alt="Ghost" className="help-enemy-img" />
            </div>
            <div className="help-enemy-details">
              <strong>Gremlin</strong>
              <p>Damage: 10 HP | Shots to kill: 2</p>
              <p className="help-enemy-desc">Fast but weak</p>
            </div>
          </div>
          
          <div className="help-enemy-item">
            <div className="help-enemy-badge krampus">
              <img src="/src/assets/enemy_sprites/krampus.png" alt="Krampus" className="help-enemy-img" />
            </div>
            <div className="help-enemy-details">
              <strong>Krampus</strong>
              <p>Damage: 20 HP | Shots to kill: 3</p>
              <p className="help-enemy-desc">Strong enemy, requires multiple hits</p>
            </div>
          </div>
          
          <div className="help-enemy-item">
            <div className="help-enemy-badge boss">
              <img src="/src/assets/enemy_sprites/orcBoss.png" alt="BOSS" className="help-enemy-img" />
            </div>
            <div className="help-enemy-details">
              <strong>BOSS</strong>
              <p>Damage: 50 HP | Shots to kill: 5+</p>
              <p className="help-enemy-desc">Very dangerous, high health</p>
            </div>
          </div>
        </div>
        
        <div className="help-section">
          <h3 className="help-section-title">OBJECTIVE</h3>
          <p className="help-objective-text">
            🎯 Shoot enemies to the beat of the music!<br/>
            ❤️ Survive as long as possible - you have 500 HP<br/>
            ⭐ Get the highest score by defeating enemies<br/>
            🎵 Stronger beats spawn tougher enemies
          </p>
        </div>
      </div>
    </div>
  );
}
