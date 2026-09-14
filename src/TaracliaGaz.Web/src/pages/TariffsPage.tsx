import { useEffect, useState } from "react";
import { getActiveTariffs, calculateTariff } from "../api/contentApi";
import type { Tariff, TariffCalculation } from "../types/content";
import SEO from "../components/SEO";
import { IconCalculator, IconInfo, IconDocument, IconPrinter } from "../components/icons";
export default function TariffsPage() {
    const [tariffs, setTariffs] = useState<Tariff[]>([]);
    const [loading, setLoading] = useState(true);

    // Калькулятор
    const [cubicMeters, setCubicMeters] = useState<string>("100");
    const [selectedCategory, setSelectedCategory] = useState<string>("residential");
    const [calculation, setCalculation] = useState<TariffCalculation | null>(null);
    const [calcError, setCalcError] = useState<string | null>(null);
    const [calculating, setCalculating] = useState(false);

    useEffect(() => {
        getActiveTariffs()
            .then(setTariffs)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Автоматический расчёт при изменении ввода
    useEffect(() => {
        const m3 = parseFloat(cubicMeters);
        if (isNaN(m3) || m3 <= 0) {
            setCalculation(null);
            return;
        }

        setCalculating(true);
        setCalcError(null);

        calculateTariff(m3, selectedCategory)
            .then(setCalculation)
            .catch(() => setCalcError("Не удалось выполнить расчёт"))
            .finally(() => setCalculating(false));
    }, [cubicMeters, selectedCategory]);

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString("ru-RU", {
                day: "2-digit", month: "long", year: "numeric",
            });
        } catch { return iso; }
    };

    const formatMoney = (amount: number | undefined | null): string => {
        if (amount === undefined || amount === null || isNaN(amount)) {
            return "0.00";
        }
        return new Intl.NumberFormat("ru-RU", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const groupedTariffs = tariffs.reduce((acc, t) => {
        if (!acc[t.category]) acc[t.category] = [];
        acc[t.category].push(t);
        return acc;
    }, {} as Record<string, Tariff[]>);

    const categoryLabels: Record<string, string> = {
        residential: "Бытовые потребители",
        commercial: "Коммерческие потребители",
        industrial: "Промышленные потребители",
    };

    return (
        <>


             
            {/* Печатный заголовок — виден только при печати */}
            <div className="print-header">
                <h1>SRL «Taraclia Gaz» — Тарифы на природный газ</h1>
                <p className="print-date">
                    Распечатано: {new Date().toLocaleDateString("ru-RU", {
                        day: "2-digit", month: "long", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                    })}
                </p>
            </div>

            {/* Кнопка печати */}
            <button
                onClick={() => window.print()}
                className="print-trigger"
                type="button"
            >
                <IconPrinter /> Распечатать тарифы
            </button>

            <SEO
                title="Тарифы на газ"
                description="Действующие тарифы на природный газ SRL «Taraclia Gaz». Калькулятор стоимости. Утверждены ANRE Молдовы."
                path="/tariffs"
            />

            <section className="section">
                <div className="container">
                    <h1>Тарифы на природный газ</h1>

                    {/* Калькулятор */}
                    <div className="tariff-calculator">
                        <h2><IconCalculator /> Калькулятор стоимости</h2>
                        <p className="calc-hint">
                            Узнайте стоимость газа по действующему тарифу
                        </p>

                        <div className="calc-form">
                            <div className="calc-field">
                                <label htmlFor="cubic-meters">
                                    Объём потребления (м³)
                                </label>
                                <input
                                    id="cubic-meters"
                                    type="number"
                                    min="0"
                                    max="1000000"
                                    step="0.1"
                                    value={cubicMeters}
                                    onChange={(e) => setCubicMeters(e.target.value)}
                                    placeholder="Например: 100"
                                />
                            </div>

                            <div className="calc-field">
                                <label htmlFor="category">Категория потребителя</label>
                                <select
                                    id="category"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="residential">Бытовые потребители</option>
                                    <option value="commercial">Коммерческие</option>
                                </select>
                            </div>
                        </div>

                        {calculating && (
                            <p className="calc-result calc-loading">Расчёт...</p>
                        )}

                        {calcError && (
                            <p className="calc-result calc-error">{calcError}</p>
                        )}

                        {calculation && !calculating && (
                            <div className="calc-result">
                                <div className="calc-breakdown">
                                    <div className="calc-row">
                                        <span>Тариф:</span>
                                        <strong>{formatMoney(calculation.pricePerM3)} MDL/м³</strong>
                                    </div>
                                    {calculation.fixedFee > 0 && (
                                        <div className="calc-row">
                                            <span>Абонплата:</span>
                                            <strong>{formatMoney(calculation.fixedFee)} MDL</strong>
                                        </div>
                                    )}
                                    <div className="calc-row">
                                        <span>Стоимость газа ({calculation.cubicMeters} м³ × {formatMoney(calculation.pricePerM3)}):</span>
                                        <strong>{formatMoney(calculation.gasCost)} MDL</strong>
                                    </div>
                                    <div className="calc-row calc-total">
                                        <span>Итого к оплате:</span>
                                        <strong>{formatMoney(calculation.total)} MDL</strong>
                                    </div>
                                </div>

                                {calculation.sourceDecision && (
                                    <p className="calc-source">
                                        <IconDocument /> Тариф утверждён: {calculation.sourceDecision}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Таблица тарифов */}
                    <h2>Действующие тарифы</h2>

                    {loading ? (
                        <p>Загрузка тарифов...</p>
                    ) : tariffs.length === 0 ? (
                        <p>Действующих тарифов нет</p>
                    ) : (
                        <div className="tariffs-grid">
                            {Object.entries(groupedTariffs).map(([category, items]) => (
                                <div key={category} className="tariff-category">
                                    <h3>{categoryLabels[category] || category}</h3>
                                    {items.map((t) => (
                                        <div key={t.id} className="tariff-card">
                                            <div className="tariff-price">
                                                <span className="price-value">{formatMoney(t.pricePerM3)}</span>
                                                <span className="price-unit">MDL/м³</span>
                                            </div>
                                            <h4>{t.name}</h4>
                                            {t.description && (
                                                <p className="tariff-desc">{t.description}</p>
                                            )}
                                            <div className="tariff-meta">
                                                <small>
                                                    <IconInfo /> Действует с {formatDate(t.validFrom)}
                                                </small>
                                            </div>
                                            {t.sourceDecision && (
                                                <div className="tariff-source">
                                                    <small>
                                                        <IconDocument /> {t.sourceDecision}
                                                    </small>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="page-updated">
                        Тарифы актуальны на {new Date().toLocaleDateString("ru-RU", {
                            day: "2-digit", month: "long", year: "numeric",
                        })}
                    </div>
                    {/* Дисклеймер */}
                    <div className="tariff-disclaimer">
                        <h3>Важная информация</h3>
                        <ul>
                            <li>Тарифы утверждены Национальным агентством по регулированию в энергетике (ANRE) Республики Молдова</li>
                            <li>Калькулятор носит информационный характер. Фактическая сумма может отличаться с учётом НДС и других сборов</li>
                            <li>Актуальные тарифы публикуются на официальном сайте <a href="https://anre.md" target="_blank" rel="noopener noreferrer">anre.md</a></li>
                        </ul>
                    </div>
                </div>


                {/* Печатный футер */}
                <div className="print-footer">
                    SRL «Taraclia Gaz» • ИНН: 1008620023456 • Лицензия ANRE №1234 • г. Тараклия, ул. Ленина, 1 • тел. +373 294 2-23-45
                </div>
            </section>
        </>
    );
}