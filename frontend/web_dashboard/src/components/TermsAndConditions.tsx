import React, { useState } from 'react';
import './TermsAndConditions.css';

interface TermsProps {
  onAcceptChange?: (accepted: boolean) => void;
}

const TermsAndConditions: React.FC<TermsProps> = ({ onAcceptChange }) => {
  const [isAccepted, setIsAccepted] = useState(false);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsAccepted(checked);
    if (onAcceptChange) {
      onAcceptChange(checked);
    }
  };

  return (
    <div className="terms-container">
      <h2>الشروط والأحكام - نظام التوصيات الذكي</h2>

      <section className="terms-section">
        <h3>١. طبيعة الخدمة</h3>
        <p>
          المنصة تقدم توصيات تحليلية فقط بناءً على نماذج الذكاء الاصطناعي والمؤشرات الفنية. 
          هذه التوصيات هي لأغراض تعليمية وتحليلية وليست نصيحة استثمارية.
        </p>
      </section>

      <section className="terms-section">
        <h3>٢. مسؤولية المستخدم</h3>
        <p>
          المستخدم يتحمل المسؤولية الكاملة عن أي قرارات استثمارية يتخذها. 
          المنصة ليست مسؤولة عن أي خسائر مالية أو أرباح.
        </p>
      </section>

      <section className="terms-section">
        <h3>٣. التنفيذ التلقائي (ميزة PREMIUM)</h3>
        <p>ميزة التنفيذ التلقائي متاحة فقط لمشتركي PREMIUM وتتطلب:</p>
        <ul>
          <li>إضافة مفاتيح API الخاصة بالمستخدم للوسيط.</li>
          <li>موافقة خطية وإلكترونية على شروط التنفيذ.</li>
          <li>تأكيد أن المستخدم هو المسؤول الوحيد عن جميع الصفقات.</li>
        </ul>
      </section>

      <section className="terms-section">
        <h3>٤. الخصوصية والأمان</h3>
        <p>
          يتم تشفير جميع مفاتيح API وتخزينها بشكل آمن. 
          لا يتم مشاركة أي بيانات مع أطراف ثالثة.
        </p>
      </section>

      <section className="terms-section">
        <h3>٥. تسجيل النشاطات</h3>
        <p>
          يتم تسجيل جميع الأنشطة (توصيات، صفقات، دخول) لأغراض التدقيق والامتثال القانوني.
        </p>
      </section>

      <section className="terms-section">
        <h3>٦. إخلاء المسؤولية</h3>
        <p>
          الأداء السابق لا يضمن النتائج المستقبلية. 
          الأسواق المالية محفوفة بالمخاطر، ويجب على المستخدم فهم هذه المخاطر قبل التداول.
        </p>
      </section>

      <div className="terms-acceptance">
        <label htmlFor="termsAccepted" className="checkbox-label">
          <input
            type="checkbox"
            id="termsAccepted"
            checked={isAccepted}
            onChange={handleCheckboxChange}
          />
          <span>أوافق على جميع الشروط والأحكام المذكورة أعلاه</span>
        </label>
      </div>
    </div>
  );
};

export default TermsAndConditions;
