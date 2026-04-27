import { useMemo, useState } from 'react';
import './App.css';

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_LOGO_URL = 'https://www.e2msolutions.com/images/logo.png';
const DEFAULT_ADDRESS = `A Block, 1401-1406, and 1413,\nNavratna Corporate Park Iscon,\nBopal Rd, Ambli,\nAhmedabad 380058,\nGujarat, India`;
const DEFAULT_COPYRIGHT = `Copyright © ${CURRENT_YEAR} E2M. All Rights Reserved.`;

function getSignatureHtml(values) {
  const {
    name,
    designation,
    photoUrl,
    address,
    phone,
    calendar,
    copyright,
    disclaimer,
  } = values;

  const displayName = name ? name.toUpperCase() : '';
  const photoImg = photoUrl
    ? `<img style="display:block;height:132px;width:132px;margin:auto;border-radius:50%;" src="${photoUrl}" width="132" height="132" alt="Profile" />`
    : '';
  const logoImg = `<img style="display:block;height:40px;width:auto;margin:0 0 20px" src="${DEFAULT_LOGO_URL}" alt="Company Logo" />`;

  return `
<table style="float:none;max-width:580px;min-width:580px;padding:12px 20px;font-family:Calibri, Arial;" width="580" cellspacing="0" cellpadding="0">
  <tbody>
    <tr>
      <td style="border-bottom:1px solid #d4d4d4;padding-bottom:15px;">
        <table style="max-width:540px;min-width:540px;" cellspacing="0" cellpadding="0">
          <tbody>
            <tr>
              <td style="padding-right:20px;border-right:1px solid #d4d4d4;text-align:center;" width="230" valign="middle">
                <table style="font-size:14px;color:#000;margin-bottom:0;font-family:Calibri, Arial;min-width:230px;" cellspacing="0" cellpadding="0">
                  <tbody>
                    <tr>
                      <td>${photoImg}</td>
                    </tr>
                    <tr>
                      <td style="padding-top:10px;text-align:center;">
                        ${displayName ? `<h2 style="font-size:20px;line-height:26px;font-weight:900;margin:0;font-family:Calibri, Arial;">${displayName}</h2>` : ''}
                        ${designation ? `<p style="font-size:14px;color:#4e8db4;margin-top:5px;font-weight:900;margin-bottom:10px;font-family:Calibri, Arial;">${designation}</p>` : ''}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td style="padding-left:20px;" width="350" align="left">
                ${logoImg}
                ${address ? `<p style="font-size:14px;color:#000;margin-top:6px;margin-bottom:10px;font-family:Calibri, Arial;white-space:pre-line;">${address}</p>` : ''}
                ${phone ? `<p style="font-size:14px;color:#000;margin-top:2px;margin-bottom:0;font-family:Calibri, Arial;">Phone: ${phone}</p>` : ''}
                ${calendar ? `<p style="font-size:14px;color:#000;margin-top:2px;margin-bottom:0;font-family:Calibri, Arial;">Calendar: <a style="text-decoration:none;color:#4e8db4;" href="${calendar}">${calendar.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a></p>` : ''}
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:15px 0px;">
        ${disclaimer ? `<p style="font-size:12px;color:#666;margin:0;font-family:Calibri, Arial;white-space:pre-line;">${disclaimer}</p>` : ''}
      </td>
    </tr>
    <tr>
      <td style="font-size:12px;color:#666;padding-top:8px;font-family:Calibri, Arial;">
        ${copyright ? `${copyright}` : ''}
      </td>
    </tr>
  </tbody>
</table>`;
}

function App() {
  const [form, setForm] = useState({
    name: '',
    designation: '',
    photoUrl: '',
    address: DEFAULT_ADDRESS,
    phone: '',
    calendar: '',
    disclaimer: '',
    copyright: '',
    useAddressPlaceholder: true,
    useCopyrightPlaceholder: true,
    useDisclaimerPlaceholder: true,
  });
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const html = useMemo(() => {
    const address = form.useAddressPlaceholder ? DEFAULT_ADDRESS : form.address;
    const copyright = form.useCopyrightPlaceholder ? DEFAULT_COPYRIGHT : form.copyright || DEFAULT_COPYRIGHT;
    const disclaimer = form.useDisclaimerPlaceholder ? `CONFIDENTIALITY NOTICE: This email is for the use of the intended recipient(s) only.\nIf you have received this email in error, please notify me immediately and then delete it.` : form.disclaimer;

    return getSignatureHtml({
      ...form,
      address,
      copyright,
      disclaimer,
    });
  }, [form]);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setUploadStatus('Signature HTML copied to clipboard.');
    } catch (error) {
      setUploadStatus('Copy failed. Please use browser copy manually.');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'signature.html';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setUploadStatus('HTML signature downloaded.');
  };

  const handleFillSample = () => {
    setForm({
      name: 'ANKUR SANTOKI',
      designation: 'Lead Frontend Developer',
      photoUrl: '/images/photo.png',
      address: DEFAULT_ADDRESS,
      phone: '(+91) 97-26265550',
      calendar: 'https://cal.com/yourhandle',
      disclaimer: 'CONFIDENTIALITY NOTICE: This email is for the use of the intended recipient(s) only.\nIf you have received this email in error, please notify me immediately and then delete it.',
      copyright: DEFAULT_COPYRIGHT,
      useAddressPlaceholder: true,
      useCopyrightPlaceholder: true,
      useDisclaimerPlaceholder: true,
    });
  };

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setFile(nextFile);
    if (nextFile) {
      setUploadStatus(`${nextFile.name} selected. Ready to upload.`);
    }
  };

  const handleUploadPhoto = async () => {
    if (!file) {
      setUploadStatus('Please choose a photo before uploading.');
      return;
    }

    setSaving(true);
    setUploadStatus('Uploading photo...');
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('name', form.name || file.name.replace(/\.[^.]+$/, ''));

      const response = await fetch('/upload-photo', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        updateField('photoUrl', result.url);
        setUploadStatus('Photo uploaded successfully. URL set.');
      } else {
        setUploadStatus(result.error || 'Upload failed.');
      }
    } catch (error) {
      setUploadStatus('Upload failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app">
      <div className="wrap">
        <div className="panel form">
          <div className="card">
            <div className="card-header">
              <span className="icon">👤</span>
              <h3 className="card-title">Profile Information</h3>
            </div>
            <div className="card-body">
              <div className="field">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="ANKUR SANTOKI"
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="designation">Job Title</label>
                <input
                  id="designation"
                  type="text"
                  placeholder="Lead Frontend Developer"
                  value={form.designation}
                  onChange={(event) => updateField('designation', event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="photoUrl">Profile Photo</label>
                <input
                  id="photoUrl"
                  type="text"
                  placeholder="/images/your-photo.jpg"
                  value={form.photoUrl}
                  onChange={(event) => updateField('photoUrl', event.target.value)}
                />
                <div className="hint">Upload a photo to /images or paste an image URL.</div>
                <div className="row" style={{ marginTop: 8, alignItems: 'center' }}>
                  <label className="file-trigger">
                    <span>Choose file</span>
                    <input id="photoFile" type="file" accept="image/*" onChange={handleFileChange} />
                  </label>
                  <button type="button" className="secondary" disabled>
                    Edit photo
                  </button>
                  <button type="button" onClick={handleUploadPhoto} disabled={saving}>
                    {saving ? 'Uploading…' : 'Upload to /images'}
                  </button>
                </div>
                <div className="hint">Upload saves to /images and fills the URL above.</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="icon">🏢</span>
              <h3 className="card-title">Company Details</h3>
            </div>
            <div className="card-body">
              <div className="field">
                <label htmlFor="logo">Company Logo URL</label>
                <input id="logo" type="url" value={DEFAULT_LOGO_URL} readOnly />
                <div className="hint">Logo URL applied to all signatures.</div>
              </div>
              <div className="field">
                <label htmlFor="address">Company Address</label>
                <textarea
                  id="address"
                  value={form.address}
                  onChange={(event) => updateField('address', event.target.value)}
                />
                <div className="hint">
                  <label>
                    <input
                      id="useAddressPlaceholder"
                      type="checkbox"
                      checked={form.useAddressPlaceholder}
                      onChange={(event) => updateField('useAddressPlaceholder', event.target.checked)}
                    />{' '}
                    Use placeholder in output
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="icon">☎️</span>
              <h3 className="card-title">Contact Information</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    type="text"
                    placeholder="(+91) 97-26265550"
                    value={form.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                  />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor="website">Website</label>
                  <input id="website" type="url" value="https://www.e2msolutions.com/" readOnly />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="icon">🔗</span>
              <h3 className="card-title">Links & Legal</h3>
            </div>
            <div className="card-body">
              <div className="field">
                <label htmlFor="calendar">Schedule a meeting link</label>
                <input
                  id="calendar"
                  type="url"
                  placeholder="https://cal.com/yourhandle"
                  value={form.calendar}
                  onChange={(event) => updateField('calendar', event.target.value)}
                />
              </div>
              <div className="row">
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor="copyright">Copyright Text</label>
                  <input
                    id="copyright"
                    type="text"
                    placeholder={DEFAULT_COPYRIGHT}
                    value={form.copyright}
                    onChange={(event) => updateField('copyright', event.target.value)}
                  />
                  <div className="hint">
                    <label>
                      <input
                        id="useCopyrightPlaceholder"
                        type="checkbox"
                        checked={form.useCopyrightPlaceholder}
                        onChange={(event) => updateField('useCopyrightPlaceholder', event.target.checked)}
                      />{' '}
                      Use placeholder in output
                    </label>
                  </div>
                </div>
              </div>
              <div className="field">
                <label htmlFor="disclaimer">Confidentiality Notice</label>
                <textarea
                  id="disclaimer"
                  placeholder="CONFIDENTIALITY NOTICE: This email is for the use of the intended recipient(s) only.\nIf you have received this email in error, please notify me immediately and then delete it."
                  value={form.disclaimer}
                  onChange={(event) => updateField('disclaimer', event.target.value)}
                />
                <div className="hint">
                  <label>
                    <input
                      id="useDisclaimerPlaceholder"
                      type="checkbox"
                      checked={form.useDisclaimerPlaceholder}
                      onChange={(event) => updateField('useDisclaimerPlaceholder', event.target.checked)}
                    />{' '}
                    Use placeholder in output
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="buttons">
            <button type="button" className="secondary" onClick={handleFillSample}>
              Fill sample
            </button>
            <button type="button" onClick={handleCopy}>
              Copy HTML
            </button>
            <button type="button" className="secondary" onClick={handleDownload}>
              Download HTML
            </button>
          </div>
          <div className="hint" style={{ marginTop: 6 }}>{uploadStatus}</div>
        </div>

        <div className="panel preview-pad">
          <h3 className="preview-title">Live Preview</h3>
          <div id="preview" className="preview">
            <div className="sig-wrap" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
