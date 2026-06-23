// Storymaps.io — AGPL-3.0 — see LICENCE for details
// Card detail expand modal

import { dom } from '/src/ui/dom.js';
import { pushUndo } from '/src/core/state.js';
import { isMapEditable } from '/src/core/lock.js';
import { el, generateId } from '/src/core/constants.js';
import * as log from '/src/core/log.js';

let _deps = {};

export const init = (deps) => { _deps = deps; };

let _expandedItem = null;
let _editable = false;
let _closingExpandViaBack = false;
let _poppingExpandState = false;

export const getExpandedItem = () => _expandedItem;
export const isPoppingExpandState = () => _poppingExpandState;
export const clearPoppingExpandState = () => { _poppingExpandState = false; };

const autoResizeExpandName = () => {
    dom.cardExpandName.style.height = 'auto';
    dom.cardExpandName.style.height = dom.cardExpandName.scrollHeight + 'px';
};

const formatTimestamp = (ts) => {
    if (!ts) return '';
    try { return new Date(ts).toLocaleString(); } catch { return ''; }
};

const renderComment = (c) => {
    const item = el('div', 'comment-item', { 'data-comment-id': c.id });
    const meta = el('div', 'comment-meta');
    meta.appendChild(el('span', 'comment-author', { text: c.author || 'Anonymous' }));
    meta.appendChild(el('span', 'comment-time', { text: formatTimestamp(c.ts) }));
    if (_editable) {
        const del = el('button', 'comment-delete', { type: 'button', title: 'Delete comment', text: '×' });
        del.addEventListener('click', () => {
            if (!_expandedItem) return;
            _expandedItem.comments = (_expandedItem.comments || []).filter(x => x.id !== c.id);
            _deps.saveToStorage();
            renderComments();
        });
        meta.appendChild(del);
    }
    item.appendChild(meta);
    item.appendChild(el('div', 'comment-text', { text: c.text }));
    return item;
};

const renderComments = () => {
    const list = dom.cardExpandCommentsList;
    if (!list) return;
    if (_expandedItem && !Array.isArray(_expandedItem.comments)) _expandedItem.comments = [];
    const comments = _expandedItem?.comments || [];
    list.innerHTML = '';
    if (dom.cardExpandCommentsCount) dom.cardExpandCommentsCount.textContent = comments.length ? `(${comments.length})` : '';
    if (comments.length === 0) {
        list.appendChild(el('p', 'comments-empty', { text: 'No comments yet.' }));
    } else {
        comments.forEach(c => list.appendChild(renderComment(c)));
    }
    if (dom.cardExpandCommentForm) dom.cardExpandCommentForm.style.display = _editable ? '' : 'none';
};

export const openExpandModal = (item, { readOnly = false } = {}) => {
    // If a previous close is still waiting for its popstate, absorb it now
    if (_poppingExpandState) {
        _poppingExpandState = false;
    }
    _expandedItem = item;
    const editable = !readOnly && isMapEditable();
    _editable = editable;
    dom.cardExpandName.value = item.name || '';
    dom.cardExpandBody.value = item.body || '';
    dom.cardExpandName.readOnly = !editable;
    dom.cardExpandBody.readOnly = !editable;
    if (dom.cardExpandCommentInput) dom.cardExpandCommentInput.value = '';
    renderComments();
    const modal = dom.cardExpandModal.querySelector('.card-expand-modal');
    if (modal) modal.style.backgroundColor = item.color || '';
    dom.cardExpandModal.classList.add('visible');
    requestAnimationFrame(autoResizeExpandName);
    if (editable) {
        dom.cardExpandName.focus();
        pushUndo();
    }
    history.pushState({ cardExpand: true }, '');
};

export const closeExpandModal = () => {
    if (!dom.cardExpandModal.classList.contains('visible')) return;
    dom.cardExpandModal.classList.remove('visible');
    _expandedItem = null;
    _deps.renderAndSave();
    // Pop the history entry we pushed on open, unless we got here via back button
    if (!_closingExpandViaBack) {
        _poppingExpandState = true;
        history.back();
    }
};

// Called by popstate handler to close via back button
export const closeExpandViaBack = () => {
    _closingExpandViaBack = true;
    closeExpandModal();
    _closingExpandViaBack = false;
};

export const initListeners = () => {
    dom.cardExpandName.addEventListener('input', () => {
        if (!_expandedItem) return;
        _expandedItem.name = dom.cardExpandName.value;
        log.logTextEdit('card title', _expandedItem.id);
        autoResizeExpandName();
        _deps.saveToStorage();
    });

    dom.cardExpandBody.addEventListener('input', () => {
        if (!_expandedItem) return;
        _expandedItem.body = dom.cardExpandBody.value;
        log.logTextEdit('card body', _expandedItem.id);
        _deps.saveToStorage();
    });

    dom.cardExpandCommentForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!_expandedItem || !_editable) return;
        const input = dom.cardExpandCommentInput;
        const text = (input?.value || '').trim();
        if (!text) return;
        if (!Array.isArray(_expandedItem.comments)) _expandedItem.comments = [];
        const author = (localStorage.getItem('presenceName') || '').trim() || 'You';
        _expandedItem.comments.push({ id: generateId(), text, ts: new Date().toISOString(), author });
        input.value = '';
        log.logTextEdit('card comment', _expandedItem.id);
        _deps.saveToStorage();
        renderComments();
        input.focus();
    });

    // Cmd/Ctrl+Enter submits the comment from the textarea.
    dom.cardExpandCommentInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            dom.cardExpandCommentForm?.requestSubmit();
        }
    });

    document.getElementById('cardExpandModalClose')?.addEventListener('click', closeExpandModal);
    dom.cardExpandModal.addEventListener('click', (e) => {
        if (e.target === dom.cardExpandModal) closeExpandModal();
    });
};
