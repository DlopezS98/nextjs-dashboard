"use server";

import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const FormSchema = z.object({
	id: z.string(),
	customerId: z.string({ message: "Please select a customer." }),
	amount: z.coerce
		.number()
		.gt(0, { message: "Please enter an amount greater than $0." }),
	status: z.enum(["pending", "paid"], {
		message: "Please select an invoice status.",
	}),
	date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
	errors?: {
		customerId?: string[];
		amount?: string[];
		status?: string[];
	};
	message?: string | null;
};

// prev state, form data
export async function createInvoice(_: State, formData: FormData) {
	// const rawFormData = {
	// 	customerId: formData.get("customerId"),
	// 	amount: formData.get("amount"),
	// 	status: formData.get("status"),
	// };

	try {
		const rawFormData = Object.fromEntries(formData.entries());
		const validatedData = CreateInvoice.safeParse(rawFormData);

		if (!validatedData.success) {
			console.log(validatedData.error.flatten());
			return {
				errors: validatedData.error.flatten().fieldErrors,
				message: "Missing fields. Failed to create invoice",
			};
		}

		const { amount, customerId, status } = validatedData.data;
		const amountInCents = amount * 100;
		const date = new Date().toISOString().split("T")[0];

		await sql`
        	INSERT INTO invoices (customer_id, amount, status, date)
        	VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    	`;
	} catch (error) {
		return { message: "Database Error: Failed to Create Invoice." };
	}

	revalidatePath("/dashboard/invoices");
	redirect("/dashboard/invoices");
}

export async function updateInvoice(id: string, _: State, formData: FormData) {
	const rawFormData = Object.fromEntries(formData.entries());
	const parseResult = UpdateInvoice.safeParse(rawFormData);

	if (!parseResult.success) {
		return {
			errors: parseResult.error.flatten().fieldErrors,
			message: "Missing fields. Failed to update invoice.",
		};
	}

	const { customerId, amount, status } = parseResult.data;
	const amountInCents = amount * 100;

	try {
		await sql`
		  UPDATE invoices
		  SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
		  WHERE id = ${id}
		`;
	} catch (error) {
		return { message: "Database Error: Failed to Update Invoice." };
	}

	revalidatePath("/dashboard/invoices");
	redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
	try {
		await sql`DELETE FROM invoices WHERE id = ${id}`;
		revalidatePath("/dashboard/invoices");

		return { message: "Deleted Invoice." };
	} catch (error) {
		return { message: "Database Error: Failed to Delete Invoice." };
	}
}
