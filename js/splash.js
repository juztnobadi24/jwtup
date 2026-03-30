/* ======================== FIREBASE CHAT & NOTIFICATIONS STYLES ======================== */

/* Chat Modal Overrides */
.chat-modal .modal-content {
    max-width: 600px;
    height: 80vh;
    display: flex;
    flex-direction: column;
    padding: 0;
}

.chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-secondary);
    border-radius: 28px;
    overflow: hidden;
}

.chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: var(--bg-tertiary);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.chat-header h3 {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.2rem;
    color: var(--accent);
}

.chat-header h3 i {
    font-size: 1.2rem;
}

.chat-header .chat-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0 8px;
    transition: all var(--transition-fast);
}

.chat-header .chat-close:hover {
    color: var(--accent);
    transform: rotate(90deg);
}

/* Chat User Info Bar */
.chat-user-info {
    padding: 8px 1rem;
    background: var(--bg-card);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 0.75rem;
    color: var(--text-secondary);
    min-height: 48px;
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.1);
}

.user-info-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: nowrap;
}

.user-info-left i {
    color: var(--accent);
    font-size: 0.85rem;
    flex-shrink: 0;
}

.user-info-left strong {
    color: var(--text-primary);
    font-weight: 600;
    white-space: nowrap;
}

.user-info-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.admin-badge {
    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.7rem;
    color: white;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
}

.admin-badge i {
    color: white;
    font-size: 0.65rem;
}

/* Logout Admin Button */
.logout-admin-btn {
    background: rgba(249, 115, 22, 0.15);
    border: 1px solid rgba(249, 115, 22, 0.3);
    color: var(--accent);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.7rem;
    cursor: pointer;
    transition: all var(--transition-fast);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    flex-shrink: 0;
}

.logout-admin-btn:hover {
    background: rgba(249, 115, 22, 0.25);
    transform: translateY(-1px);
}

/* Chat Messages Area */
.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: var(--bg-secondary);
}

/* ... (keep existing chat message styles) ... */

/* Notifications Panel */
.notifications-modal .modal-content {
    max-width: 500px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    margin: 20px auto;
}

.notifications-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0 12px;
}

.notifications-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 1rem 1rem 0.5rem 1rem;
    flex-wrap: wrap;
    gap: 10px;
    background: transparent;
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    margin-top: 0.5rem;
}

.notifications-header-left h4 {
    font-size: 1rem;
    color: var(--text-primary);
    margin: 0;
    padding-left: 8px;
    position: relative;
    display: inline-block;
}

.notifications-header-left h4:after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 8px;
    width: calc(100% - 16px);
    height: 2px;
    background: linear-gradient(90deg, var(--accent), transparent);
}

.notifications-header-left h4 i {
    color: var(--accent);
    margin-right: 8px;
}

.notifications-header-right {
    display: flex;
    gap: 8px;
    padding-right: 8px;
}

.compose-notification-btn {
    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
    border: none;
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 2px 6px rgba(249, 115, 22, 0.3);
}

.compose-notification-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.notification-clear-btn {
    background: rgba(239, 68, 68, 0.12);
    border: none;
    color: var(--error);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    gap: 6px;
}

.notification-clear-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    transform: translateY(-1px);
}

/* Notification Items */
.notifications-list {
    flex: 1;
    overflow-y: auto;
    max-height: 60vh;
    padding: 8px 4px 12px 4px;
}

.notification-item {
    display: flex;
    gap: 12px;
    padding: 14px 16px;
    margin-bottom: 12px;
    margin-left: 8px;
    margin-right: 8px;
    background: var(--bg-card);
    border-radius: 16px;
    transition: all var(--transition-fast);
    cursor: pointer;
    animation: slideInRight 0.3s ease;
    position: relative;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.notification-item:last-child {
    margin-bottom: 0;
}

.notification-item:hover {
    background: var(--bg-hover);
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.notification-item.unread {
    background: rgba(249, 115, 22, 0.08);
    box-shadow: 0 2px 12px rgba(249, 115, 22, 0.15);
}

.notification-icon {
    width: 40px;
    height: 40px;
    background: rgba(249, 115, 22, 0.15);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
}

.notification-icon i {
    color: var(--accent);
    font-size: 1.1rem;
}

.notification-content {
    flex: 1;
    min-width: 0;
}

.notification-title {
    font-weight: 600;
    font-size: 0.85rem;
    margin-bottom: 6px;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.notification-message {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-bottom: 6px;
    line-height: 1.4;
    word-wrap: break-word;
}

.notification-time {
    font-size: 0.65rem;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 4px;
}

/* Admin Notification Styles */
.admin-notif {
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(249, 115, 22, 0.03));
}

.admin-notif-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
    padding: 2px 6px;
    border-radius: 12px;
    font-size: 0.6rem;
    color: white;
}

.notification-delete-btn {
    background: rgba(239, 68, 68, 0.12);
    border: none;
    color: var(--error);
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
    flex-shrink: 0;
    margin-top: 4px;
}

.notification-delete-btn:hover {
    background: rgba(239, 68, 68, 0.25);
    transform: scale(1.05);
}

/* Compose Modal */
.compose-modal .modal-content {
    max-width: 500px;
    margin: 20px auto;
}

.compose-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0 4px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-group label {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 6px;
    padding-left: 4px;
}

.form-group label i {
    color: var(--accent);
    font-size: 0.85rem;
}

.form-input,
.form-textarea {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 10px 12px;
    color: var(--text-primary);
    font-size: 0.85rem;
    outline: none;
    transition: all var(--transition-fast);
    font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-glow);
}

.form-textarea {
    resize: vertical;
    min-height: 80px;
}

/* Info Note */
.info-note {
    background: rgba(249, 115, 22, 0.08);
    padding: 10px 14px;
    border-radius: 12px;
    margin: 8px 0;
    font-size: 0.75rem;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(255, 255, 255, 0.05);
}

.info-note i {
    color: var(--accent);
    font-size: 0.9rem;
    flex-shrink: 0;
}

.compose-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 0.5rem;
    padding: 4px 0;
}

.btn-cancel {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 8px 20px;
    border-radius: 8px;
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: 0.85rem;
}

.btn-cancel:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
    transform: translateY(-1px);
}

.btn-send {
    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
    border: none;
    color: white;
    padding: 8px 24px;
    border-radius: 8px;
    cursor: pointer;
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    box-shadow: 0 2px 6px rgba(249, 115, 22, 0.3);
}

.btn-send:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.btn-send:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

/* Empty State */
.notifications-empty {
    text-align: center;
    padding: 2rem;
    color: var(--text-muted);
    background: transparent;
}

.notifications-empty i {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    opacity: 0.5;
}

/* Animations */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Mobile Responsive */
@media (max-width: 640px) {
    .chat-modal .modal-content {
        width: 85%;
        height: 60vh;
    }
    
    .chat-header {
        padding: 0.8rem 1rem;
        box-shadow: 0 1px 8px rgba(0, 0, 0, 0.15);
    }
    
    .chat-header h3 {
        font-size: 1rem;
    }
    
    .chat-user-info {
        padding: 6px 10px;
        min-height: 44px;
    }
    
    .message-avatar {
        width: 28px;
        height: 28px;
        font-size: 0.7rem;
    }
    
    .message-bubble {
        padding: 8px 12px;
    }
    
    .message-text {
        font-size: 0.8rem;
    }
    
    .chat-input-area {
        padding: 0.8rem;
    }
    
    .chat-input {
        padding: 8px 12px;
        font-size: 0.8rem;
    }
    
    .chat-send-btn {
        width: 36px;
        height: 36px;
    }
    
    .notifications-header {
        padding: 0.8rem 0.8rem 0.5rem 0.8rem;
    }
    
    .notification-item {
        padding: 12px 12px;
        gap: 10px;
        margin-bottom: 10px;
    }
    
    .notification-icon {
        width: 32px;
        height: 32px;
    }
    
    .notification-icon i {
        font-size: 0.9rem;
    }
    
    .compose-modal .modal-content {
        width: 95%;
        margin: 10px auto;
    }
    
    .compose-actions {
        flex-direction: column;
        gap: 8px;
    }
    
    .btn-cancel,
    .btn-send {
        width: 100%;
        justify-content: center;
        padding: 10px;
    }
}
