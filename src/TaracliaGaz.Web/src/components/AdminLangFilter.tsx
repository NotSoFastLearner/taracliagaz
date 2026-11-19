export type AdminLangFilterValue = "all" | "ru" | "ro";

interface AdminLangFilterProps<T extends { languageCode: string }> {
    value: AdminLangFilterValue;
    onChange: (next: AdminLangFilterValue) => void;
    items: T[];
}

export default function AdminLangFilter<T extends { languageCode: string }>({
    value,
    onChange,
    items,
}: AdminLangFilterProps<T>) {
    const ruCount = items.filter((item) => item.languageCode === "ru").length;
    const roCount = items.filter((item) => item.languageCode === "ro").length;

    const options: { id: AdminLangFilterValue; label: string }[] = [
        { id: "all", label: `Все (${items.length})` },
        { id: "ru", label: `RU (${ruCount})` },
        { id: "ro", label: `RO (${roCount})` },
    ];

    return (
        <div className="admin-lang-filter" role="group" aria-label="Фильтр по языку">
            {options.map((opt) => (
                <button
                    key={opt.id}
                    type="button"
                    className={`admin-lang-btn ${value === opt.id ? "active" : ""}`}
                    onClick={() => onChange(opt.id)}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
