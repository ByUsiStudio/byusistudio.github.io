import { useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUiConfig } from '../context/UiConfigContext';
import { useLocalStorage, exportToJson, importFromJson } from '../hooks/useLocalStorage';
import type { ContactMessage } from '../types/ui';

const STORAGE_KEY = 'byusi_contact_messages';

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateForm = (formData: { name: string; email: string; subject: string; message: string }): FormErrors => {
  const errors: FormErrors = {};

  if (!formData.name.trim()) {
    errors.name = '请输入您的姓名';
  } else if (formData.name.trim().length > 50) {
    errors.name = '姓名不能超过50个字符';
  }

  if (!formData.email.trim()) {
    errors.email = '请输入您的邮箱';
  } else if (!validateEmail(formData.email)) {
    errors.email = '请输入有效的邮箱地址';
  }

  if (!formData.subject.trim()) {
    errors.subject = '请输入主题';
  } else if (formData.subject.trim().length > 100) {
    errors.subject = '主题不能超过100个字符';
  }

  if (!formData.message.trim()) {
    errors.message = '请输入留言内容';
  } else if (formData.message.trim().length > 2000) {
    errors.message = '留言内容不能超过2000个字符';
  }

  return errors;
};

export const Contact = () => {
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
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [messages] = useLocalStorage<ContactMessage[]>(STORAGE_KEY, []);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(messages.length / itemsPerPage);
  const paginatedMessages = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return messages.slice(start, start + itemsPerPage);
  }, [messages, currentPage, itemsPerPage]);

  const setMessages = useMemo(() => {
    return (newMessages: ContactMessage[]) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
        window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(newMessages) }));
      } catch (err) {
        console.error('保存留言失败:', err);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const newMessage: ContactMessage = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
      createdAt: new Date().toISOString(),
    };

    const newMessages = [newMessage, ...messages].slice(0, contactConfig.maxDisplayMessages);
    setMessages(newMessages);

    setSubmitting(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });

    setTimeout(() => setSubmitted(false), 5000);
  };

  const deleteMessage = (id: string) => {
    const newMessages = messages.filter((msg) => msg.id !== id);
    setMessages(newMessages);
    if (currentPage > 1 && paginatedMessages.length === 1) {
      setCurrentPage((prev) => Math.max(1, prev - 1));
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExport = () => {
    exportToJson(messages, `byusi-contact-messages-${new Date().toISOString().split('T')[0]}.json`);
  };

  const handleImport = () => {
    importFromJson<ContactMessage[]>((importedMessages) => {
      if (Array.isArray(importedMessages)) {
        const validMessages = importedMessages.filter((msg) => 
          msg.id && msg.name && msg.email && msg.subject && msg.message && msg.createdAt
        );
        const newMessages = [...validMessages, ...messages].slice(0, contactConfig.maxDisplayMessages);
        setMessages(newMessages);
        setCurrentPage(1);
      }
    });
  };

  const handleClearAll = () => {
    if (confirm('确定要清空所有留言吗？此操作不可恢复。')) {
      setMessages([]);
      setCurrentPage(1);
    }
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
            <form onSubmit={handleSubmit} className="contact-form" noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">{contactConfig.form.nameLabel}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="请输入您的姓名"
                    className={errors.name ? 'error' : ''}
                    maxLength={50}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="email">{contactConfig.form.emailLabel}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="请输入您的邮箱"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
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
                  placeholder="请输入主题"
                  className={errors.subject ? 'error' : ''}
                  maxLength={100}
                />
                {errors.subject && <span className="error-message">{errors.subject}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="message">{contactConfig.form.messageLabel}</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="请输入您的留言内容..."
                  className={errors.message ? 'error' : ''}
                  rows={5}
                  maxLength={2000}
                />
                {errors.message && <span className="error-message">{errors.message}</span>}
                <div className="char-count">
                  {formData.message.length}/2000
                </div>
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

        {contactConfig.showMessages && (
          <div className="contact-messages">
            <div className="messages-header">
              <h3>历史留言</h3>
              <div className="messages-actions">
                <button className="action-btn" onClick={handleExport}>
                  <i className="fas fa-download"></i> 导出
                </button>
                <button className="action-btn" onClick={handleImport}>
                  <i className="fas fa-upload"></i> 导入
                </button>
                {messages.length > 0 && (
                  <button className="action-btn danger" onClick={handleClearAll}>
                    <i className="fas fa-trash"></i> 清空
                  </button>
                )}
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-comments"></i>
                <h4>暂无留言</h4>
                <p>快来发表第一条留言吧！</p>
              </div>
            ) : (
              <>
                <div className="messages-list">
                  {paginatedMessages.map((msg) => (
                    <div key={msg.id} className="message-item">
                      <div className="message-header">
                        <div className="message-info">
                          <span className="message-name">{msg.name}</span>
                          <span className="message-date">{formatDate(msg.createdAt)}</span>
                        </div>
                        <button
                          className="delete-btn"
                          onClick={() => deleteMessage(msg.id)}
                          aria-label="删除留言"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                      <div className="message-subject">{msg.subject}</div>
                      <div className="message-content">{msg.message}</div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="page-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                      <i className="fas fa-chevron-left"></i> 上一页
                    </button>
                    <span className="page-info">
                      第 {currentPage} 页 / 共 {totalPages} 页
                    </span>
                    <button
                      className="page-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      下一页 <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
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
          margin-bottom: 50px;
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
          transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: ${theme.primary};
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        .form-group input.error,
        .form-group textarea.error {
          border-color: ${theme.accent};
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: ${theme['dark-gray']};
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
        }

        .error-message {
          display: block;
          color: ${theme.accent};
          font-size: 12px;
          margin-top: 5px;
        }

        .char-count {
          text-align: right;
          font-size: 12px;
          color: ${theme['dark-gray']};
          margin-top: 5px;
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

        .contact-messages {
          background: ${theme['card-bg']};
          padding: 30px;
          border-radius: 8px;
          box-shadow: ${theme.shadow};
        }

        .messages-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .contact-messages h3 {
          color: ${theme.secondary};
          font-size: 20px;
          margin: 0;
        }

        .messages-actions {
          display: flex;
          gap: 10px;
        }

        .action-btn {
          padding: 8px 16px;
          background: ${theme['bg-color']};
          border: 1px solid ${theme['border-color']};
          color: ${theme['text-color']};
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .action-btn.danger {
          color: ${theme.accent};
          border-color: rgba(231, 76, 60, 0.3);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: ${theme['dark-gray']};
        }

        .empty-state i {
          font-size: 48px;
          margin-bottom: 20px;
          display: block;
          color: ${theme.primary};
          opacity: 0.5;
        }

        .empty-state h4 {
          margin-bottom: 10px;
          color: ${theme.secondary};
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 20px;
        }

        .message-item {
          padding: 15px;
          background: ${theme['bg-color']};
          border-radius: 6px;
          border: 1px solid ${theme['border-color']};
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .message-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .message-name {
          font-weight: 600;
          color: ${theme.secondary};
          font-size: 15px;
        }

        .message-date {
          font-size: 12px;
          color: ${theme['dark-gray']};
        }

        .delete-btn {
          background: transparent;
          border: none;
          color: ${theme.accent};
          cursor: pointer;
          padding: 5px;
          font-size: 14px;
        }

        .message-subject {
          font-weight: 500;
          color: ${theme.primary};
          font-size: 14px;
          margin-bottom: 8px;
        }

        .message-content {
          color: ${theme['text-color']};
          font-size: 14px;
          line-height: 1.6;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 20px;
        }

        .page-btn {
          padding: 10px 20px;
          border: 1px solid ${theme['border-color']};
          background: ${theme['bg-color']};
          color: ${theme['text-color']};
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-info {
          color: ${theme['dark-gray']};
          font-size: 14px;
        }

        @media (max-width: 992px) {
          .contact-content {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .messages-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }
        }

        @media (max-width: 576px) {
          .contact-info,
          .contact-form-container,
          .contact-messages {
            padding: 20px;
          }

          .messages-actions {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </section>
  );
};