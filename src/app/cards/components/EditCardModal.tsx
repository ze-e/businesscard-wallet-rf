import { FC } from 'react';
import { CachedCard } from '@/lib/idb';
import { splitList } from '../utils';

interface EditCardModalProps {
  editForm: CachedCard;
  setEditForm: (form: CachedCard | null) => void;
  busyCardId: string | null;
  saveEdit: () => void;
  setDeleteCandidate: (card: CachedCard | null) => void;
  requestCancelEdit: () => void;
  replaceEditLogo: (file: File | null) => void;
}

export const EditCardModal: FC<EditCardModalProps> = ({
  editForm,
  setEditForm,
  busyCardId,
  saveEdit,
  setDeleteCandidate,
  requestCancelEdit,
  replaceEditLogo
}) => {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
      <div className="modal-card modal-card-wide">
        <h2 id="edit-modal-title">Edit Card</h2>
        <label>
          Name
          <input
            value={editForm.name}
            onChange={(e) => setEditForm((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
          />
        </label>
        <label>
          Company
          <input
            value={editForm.company || ""}
            onChange={(e) =>
              setEditForm((prev) => (prev ? { ...prev, company: e.target.value || null } : prev))
            }
          />
        </label>
        <label>
          Logo Image
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => replaceEditLogo(e.target.files?.[0] || null)} />
        </label>
        <p className="muted" style={{ marginTop: 6, marginBottom: 10 }}>
          Logo image extraction is currently in development and may be inaccurate. Please review and adjust manually.
        </p>
        {editForm.logoImage && (
          <div style={{ marginTop: 8, marginBottom: 8 }}>
            <button className="button-secondary" onClick={() => setEditForm((prev) => (prev ? { ...prev, logoImage: null } : prev))}>
              Remove Logo Image
            </button>
          </div>
        )}
        {editForm.logoImage && (
          <div style={{ marginBottom: 10 }}>
            <img src={editForm.logoImage} alt="Editable logo" style={{ maxWidth: 220, maxHeight: 120, objectFit: "contain", border: "1px solid #d6dfd8", borderRadius: 8, background: "#fff" }} />
          </div>
        )}
        <label>
          Job Title
          <input
            value={editForm.jobTitle || ""}
            onChange={(e) =>
              setEditForm((prev) => (prev ? { ...prev, jobTitle: e.target.value || null } : prev))
            }
          />
        </label>
        <label>
          Address
          <input
            value={editForm.address || ""}
            onChange={(e) =>
              setEditForm((prev) => (prev ? { ...prev, address: e.target.value || null } : prev))
            }
          />
        </label>
        <label>
          Phones (comma/newline separated)
          <textarea
            value={editForm.phones.join("\n")}
            onChange={(e) =>
              setEditForm((prev) => (prev ? { ...prev, phones: splitList(e.target.value) } : prev))
            }
          />
        </label>
        <label>
          Emails (comma/newline separated)
          <textarea
            value={editForm.emails.join("\n")}
            onChange={(e) =>
              setEditForm((prev) => (prev ? { ...prev, emails: splitList(e.target.value) } : prev))
            }
          />
        </label>
        <label>
          Websites (comma/newline separated)
          <textarea
            value={editForm.websites.join("\n")}
            onChange={(e) =>
              setEditForm((prev) => (prev ? { ...prev, websites: splitList(e.target.value) } : prev))
            }
          />
        </label>
        <label>
          Notes
          <textarea
            value={editForm.notes || ""}
            onChange={(e) =>
              setEditForm((prev) => (prev ? { ...prev, notes: e.target.value || null } : prev))
            }
          />
        </label>
        <div className="modal-actions">
          <button disabled={busyCardId === editForm.id || !editForm.name.trim()} onClick={saveEdit}>
            Save Changes
          </button>
          <button
            className="button-danger"
            disabled={busyCardId === editForm.id}
            onClick={() => setDeleteCandidate(editForm)}
          >
            Delete Card
          </button>
          <button className="button-secondary" disabled={busyCardId === editForm.id} onClick={requestCancelEdit}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};