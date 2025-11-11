import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import { sequelize } from "../db";
import { ApiResponse, calculateDuration } from "../response/response";

const BORROW_TREND_DAYS = 7;
const DUE_DATE_FALLBACK = 60;

const weekdayFormatter = new Intl.DateTimeFormat("th-TH", {
    weekday: "short",
});

const formatDateLabel = (date: Date) => weekdayFormatter.format(date);

const buildLastNDays = (days: number) => {
    const today = new Date();
    const result: Array<{ label: string; iso: string }> = [];

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const iso = d.toISOString().slice(0, 10);
        result.push({ label: formatDateLabel(d), iso });
    }

    return result;
};

const handleError = (res: Response, startTime: number, errorMessage: string) => {
    const response: ApiResponse<null> = {
        success: false,
        duration: calculateDuration(startTime),
        timestamp: new Date().toISOString(),
        error: errorMessage,
    };

    res.status(500).json(response);
};

export const getDashboardStats = async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
        const [stats]: any = await sequelize.query(
            `
        SELECT
          (SELECT COUNT(*) FROM tb_Irekeka_Stock WHERE en = 1) AS totalEquipments,
          (SELECT COUNT(*) FROM tb_Irekeka_Stock WHERE status = 'borrowed' AND en = 1) AS borrowed,
          (
            SELECT COUNT(*)
            FROM tb_Irekeka_Record
            WHERE date_in IS NULL
              AND DATEADD(DAY, ISNULL(num_date, :defaultDue), date_out) < GETDATE()
          ) AS lateReturns,
          (
            SELECT COUNT(*)
            FROM tb_Irekeka_Stock
            WHERE en = 1
              AND status IS NOT NULL
              AND (
                LOWER(status) LIKE '%maint%'
                OR LOWER(status) LIKE '%repair%'
              )
          ) AS maintenance
      `,
            {
                type: QueryTypes.SELECT,
                replacements: { defaultDue: DUE_DATE_FALLBACK },
            }
        );

        const data = {
            totalEquipments: Number(stats?.totalEquipments ?? 0),
            borrowed: Number(stats?.borrowed ?? 0),
            lateReturns: Number(stats?.lateReturns ?? 0),
            maintenance: Number(stats?.maintenance ?? 0),
        };

        const response: ApiResponse<typeof data> = {
            success: true,
            duration: calculateDuration(startTime),
            timestamp: new Date().toISOString(),
            data,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("getDashboardStats error:", error);
        handleError(res, startTime, "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ");
    }
};

export const getBorrowingTrend = async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
        const rows: Array<{ label: string; total: number }> = (await sequelize.query(
            `
        SELECT
          FORMAT(CAST(date_out AS DATE), 'yyyy-MM-dd') AS label,
          COUNT(*) AS total
        FROM tb_Irekeka_Record
        WHERE date_out >= DATEADD(DAY, -(:days - 1), CAST(GETDATE() AS DATE))
        GROUP BY FORMAT(CAST(date_out AS DATE), 'yyyy-MM-dd')
      `,
            {
                type: QueryTypes.SELECT,
                replacements: { days: BORROW_TREND_DAYS },
            }
        )) as any;

        const dayMap = new Map(rows.map((row) => [row.label, Number(row.total)]));
        const series = buildLastNDays(BORROW_TREND_DAYS).map((day) => ({
            label: day.label,
            value: dayMap.get(day.iso) ?? 0,
        }));

        const response: ApiResponse<typeof series> = {
            success: true,
            duration: calculateDuration(startTime),
            timestamp: new Date().toISOString(),
            data: series,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("getBorrowingTrend error:", error);
        handleError(res, startTime, "เกิดข้อผิดพลาดในการดึงข้อมูลเทรนด์การยืม");
    }
};

export const getReturnCompliance = async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
        const [row]: any = await sequelize.query(
            `
        SELECT
          SUM(CASE
                WHEN r.date_in IS NOT NULL
                  AND r.date_in <= DATEADD(DAY, ISNULL(r.num_date, :defaultDue), r.date_out)
                THEN 1 ELSE 0 END) AS onTime,
          SUM(CASE
                WHEN r.date_in IS NULL
                  AND CAST(DATEADD(DAY, ISNULL(r.num_date, :defaultDue), r.date_out) AS DATE) = CAST(GETDATE() AS DATE)
                THEN 1 ELSE 0 END) AS dueToday,
          SUM(CASE
                WHEN r.date_in IS NULL
                  AND DATEADD(DAY, ISNULL(r.num_date, :defaultDue), r.date_out) < GETDATE()
                THEN 1 ELSE 0 END) AS overdue
        FROM tb_Irekeka_Record r
      `,
            {
                type: QueryTypes.SELECT,
                replacements: { defaultDue: DUE_DATE_FALLBACK },
            }
        );

        const total =
            Number(row?.onTime ?? 0) +
            Number(row?.dueToday ?? 0) +
            Number(row?.overdue ?? 0) || 0;

        const percent = (value: number) =>
            total ? Number(((value / total) * 100).toFixed(2)) : 0;

        const data = {
            onTime: {
                count: Number(row?.onTime ?? 0),
                percent: percent(Number(row?.onTime ?? 0)),
            },
            dueToday: {
                count: Number(row?.dueToday ?? 0),
                percent: percent(Number(row?.dueToday ?? 0)),
            },
            overdue: {
                count: Number(row?.overdue ?? 0),
                percent: percent(Number(row?.overdue ?? 0)),
            },
        };

        const response: ApiResponse<typeof data> = {
            success: true,
            duration: calculateDuration(startTime),
            timestamp: new Date().toISOString(),
            data,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("getReturnCompliance error:", error);
        handleError(res, startTime, "เกิดข้อผิดพลาดในการดึงข้อมูลการคืนอุปกรณ์");
    }
};

export const getUpcomingReturns = async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
        const rows = (await sequelize.query(
            `
        SELECT TOP 10
          s.equipment_code,
          s.equipment_name,
          u_out.emp_name AS borrower,
          DATEADD(DAY, ISNULL(r.num_date, :defaultDue), r.date_out) AS due_date,
          DATEDIFF(
            DAY,
            CAST(GETDATE() AS DATE),
            DATEADD(DAY, ISNULL(r.num_date, :defaultDue), r.date_out)
          ) AS remaining_days
        FROM tb_Irekeka_Record r
        INNER JOIN tb_Irekeka_Stock s ON r.code = s.equipment_code
        LEFT JOIN [ITDB].[dbo].[v_Get_Emp_Name] AS u_out ON r.user_out = u_out.emp_id
        WHERE r.date_in IS NULL
          AND DATEADD(DAY, ISNULL(r.num_date, :defaultDue), r.date_out) >= CAST(GETDATE() AS DATE)
        ORDER BY DATEADD(DAY, ISNULL(r.num_date, :defaultDue), r.date_out)
      `,
            {
                type: QueryTypes.SELECT,
                replacements: { defaultDue: DUE_DATE_FALLBACK },
            }
        )) as Array<{
            equipment_code: string;
            equipment_name: string;
            borrower: string;
            due_date: Date;
            remaining_days: number;
        }>;

        const data = rows.map((row) => {
            let statusText = "ครบกำหนดวันนี้";
            if (row.remaining_days > 0) {
                statusText = `เหลืออีก ${row.remaining_days} วัน`;
            } else if (row.remaining_days < 0) {
                statusText = `เกินกำหนด ${Math.abs(row.remaining_days)} วัน`;
            }

            return {
                code: row.equipment_code,
                asset: row.equipment_name,
                borrower: row.borrower ?? "-",
                dueDate: row.due_date,
                statusText,
            };
        });

        const response: ApiResponse<typeof data> = {
            success: true,
            duration: calculateDuration(startTime),
            timestamp: new Date().toISOString(),
            data,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("getUpcomingReturns error:", error);
        handleError(res, startTime, "เกิดข้อผิดพลาดในการดึงข้อมูลกำหนดคืน");
    }
};

export const getRecentActivities = async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
        const rows = (await sequelize.query(
            `
        SELECT TOP 15 *
        FROM (
          SELECT
            r.seq,
            s.equipment_name,
            u_out.emp_name AS user_name,
            r.date_out AS action_date,
            'borrow' AS action_type
          FROM tb_Irekeka_Record r
          INNER JOIN tb_Irekeka_Stock s ON r.code = s.equipment_code
          LEFT JOIN [ITDB].[dbo].[v_Get_Emp_Name] AS u_out ON r.user_out = u_out.emp_id
          WHERE r.date_out IS NOT NULL
          UNION ALL
          SELECT
            r.seq,
            s.equipment_name,
            u_in.emp_name AS user_name,
            r.date_in AS action_date,
            'return' AS action_type
          FROM tb_Irekeka_Record r
          INNER JOIN tb_Irekeka_Stock s ON r.code = s.equipment_code
          LEFT JOIN [ITDB].[dbo].[v_Get_Emp_Name] AS u_in ON r.user_in = u_in.emp_id
          WHERE r.date_in IS NOT NULL
        ) AS logs
        WHERE action_date IS NOT NULL
        ORDER BY action_date DESC
      `,
            { type: QueryTypes.SELECT }
        )) as Array<{
            seq: number;
            equipment_name: string;
            user_name: string;
            action_date: Date;
            action_type: "borrow" | "return";
        }>;

        const data = rows.map((row) => ({
            recordSeq: row.seq,
            asset: row.equipment_name,
            user: row.user_name ?? "-",
            actionType: row.action_type,
            actionDate: row.action_date,
            message:
                row.action_type === "borrow"
                    ? `${row.user_name ?? "ผู้ใช้"} ยืม ${row.equipment_name}`
                    : `${row.user_name ?? "ผู้ใช้"} คืน ${row.equipment_name}`,
        }));

        const response: ApiResponse<typeof data> = {
            success: true,
            duration: calculateDuration(startTime),
            timestamp: new Date().toISOString(),
            data,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("getRecentActivities error:", error);
        handleError(res, startTime, "เกิดข้อผิดพลาดในการดึงกิจกรรมล่าสุด");
    }
};
