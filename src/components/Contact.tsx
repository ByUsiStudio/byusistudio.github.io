import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUiConfig } from '../context/UiConfigContext';

export function Contact() {
  const { theme } = useTheme();
  const { config } = useUiConfig();

  if (!config) return null;

  const { contact: contactConfig } = config.layout;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSubmitting(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });

    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="contact" className="section">
      <div className="layui-container">
        <h2 className="section-title">{contactConfig.title}</h2>
        <p className="section-subtitle">{contactConfig.subtitle}</p>

        <div className="contact-content">
          <div className="contact-info">
            <h3>联系方式</h3>
            <div className="contact-list">
              {contactConfig.contacts.map((contact, index) => (
                <div key={index} className="contact-item">
                  <div className="contact-icon">
                    <i className={contact.icon}></i>
                  </div>
                  <div className="contact-detail">
                    <div className="contact-label">{contact.label}</div>
                    {contact.href ? (
                      <a
                        href={contact.href}
                        className="contact-value"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {contact.value}
                      </a>
                    ) : (
                      <div className="contact-value">{contact.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="contact-form-container">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">{contactConfig.form.nameLabel}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="请输入您的姓名"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">{contactConfig.form.emailLabel}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="请输入您的邮箱"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">{contactConfig.form.subjectLabel}</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="请输入主题"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">{contactConfig.form.messageLabel}</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="请输入您的留言内容..."
                />
              </div>

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> 发送中...
                  </>
                ) : submitted ? (
                  <>
                    <i className="fas fa-check"></i> 发送成功
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> {contactConfig.form.submitButtonText}
                  </>
                )}
              </button>

              {submitted && (
                <div className="success-message">
                  <i className="fas fa-check-circle"></i> {contactConfig.form.successMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      <style>{`
        #contact {
          background: ${theme['light-gray']};
        }

        .section-subtitle {
          text-align: center;
          color: ${theme['dark-gray']};
          margin-bottom: 50px;
          font-size: 16px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .contact-content {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 40px;
        }

        .contact-info {
          background: ${theme['card-bg']};
          padding: 30px;
          border-radius: 8px;
          box-shadow: ${theme.shadow};
        }

        .contact-info h3 {
          color: ${theme.secondary};
          margin-bottom: 30px;
          font-size: 20px;
        }

        .contact-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }

        .contact-icon {
          width: 45px;
          height: 45px;
          background: rgba(52, 152, 219, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .contact-icon i {
          color: ${theme.primary};
          font-size: 18px;
        }

        .contact-detail {
          flex: 1;
        }

        .contact-label {
          font-size: 13px;
          color: ${theme['dark-gray']};
          margin-bottom: 4px;
        }

        .contact-value {
          font-size: 15px;
          color: ${theme.secondary};
          font-weight: 500;
        }

        .contact-value a {
          color: ${theme.primary};
          text-decoration: none;
        }

        .contact-value a:hover {
          text-decoration: underline;
        }

        .contact-form-container {
          background: ${theme['card-bg']};
          padding: 30px;
          border-radius: 8px;
          box-shadow: ${theme.shadow};
        }

        .contact-form {
          display: flex;
          flex-direction: column;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 600;
          color: ${theme.secondary};
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid ${theme['border-color']};
          border-radius: 6px;
          font-size: 15px;
          background: ${theme['bg-color']};
          color: ${theme['text-color']};
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: ${theme.primary};
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: ${theme['dark-gray']};
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
        }

        .submit-btn {
          padding: 14px 30px;
          background: ${theme.primary};
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .submit-btn:hover:not(:disabled) {
          background: ${theme['primary-dark']};
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .success-message {
          margin-top: 15px;
          padding: 12px 15px;
          background: rgba(46, 204, 113, 0.1);
          color: #27ae60;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
        }

        @media (max-width: 992px) {
          .contact-content {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 576px) {
          .contact-info,
          .contact-form-container {
            padding: 20px;
          }
        }
      `}</style>
    </section>
  );
}