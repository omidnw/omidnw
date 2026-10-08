import { useState } from "react";
import {
	AlertCircle,
	CheckCircle,
	FileText,
	Loader2,
	Mail,
	MessageSquare,
	Send,
	User,
} from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { FaLinkedinIn } from "react-icons/fa";
import ProfessionalPageHeader from "@/components/themes/professional/ProfessionalPageHeader";
import { EMAIL, RESUME_FILENAME, socialLinks } from "@/lib/social";

/**
 * Professional-theme contact page (`/contact`).
 *
 * The same mailto submission the CyberPunk page uses, with the validation and
 * success feedback intact — only the presentation changes. The submission opens
 * the visitor's mail client; there is no server, so nothing is captured here.
 *
 * The CyberPunk page's live clocks, timezone differential, "neural link
 * established" indicator and pulsing availability dot are all deliberately not
 * carried over. They imply a presence and a response time that cannot be
 * verified from the page, and the Professional theme states only what is true.
 */

interface ContactForm {
	name: string;
	email: string;
	subject: string;
	message: string;
}

type FieldErrors = Partial<Record<keyof ContactForm, string>>;

const EMPTY: ContactForm = { name: "", email: "", subject: "", message: "" };

/** A plain, forgiving check. Errors surface on blur and on submit. */
function validate(form: ContactForm): FieldErrors {
	const errors: FieldErrors = {};

	if (!form.name.trim()) errors.name = "Please enter your name.";
	if (!form.email.trim()) errors.email = "Please enter your email.";
	else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
		errors.email = "That email address doesn't look right.";
	if (!form.subject.trim()) errors.subject = "Please add a subject.";
	if (!form.message.trim()) errors.message = "Please write a message.";
	else if (form.message.trim().length < 10)
		errors.message = "A little more detail would help — at least 10 characters.";

	return errors;
}

const socialIcon = (name: string) =>
	name === "GitHub" ? SiGithub : name === "LinkedIn" ? FaLinkedinIn : null;

export default function ProfessionalContactPage() {
	const [form, setForm] = useState<ContactForm>(EMPTY);
	const [errors, setErrors] = useState<FieldErrors>({});
	const [submitted, setSubmitted] = useState(false);
	const [sending, setSending] = useState(false);

	const update = (
		field: keyof ContactForm,
		value: string,
	) => {
		setForm((prev) => ({ ...prev, [field]: value }));
		// Clear the error as soon as the visitor starts fixing it.
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
		if (submitted) setSubmitted(false);
	};

	const blur = (field: keyof ContactForm) => {
		const fieldErrors = validate(form);
		if (fieldErrors[field]) {
			setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
		}
	};

	const submit = (event: React.FormEvent) => {
		event.preventDefault();
		const found = validate(form);
		setErrors(found);
		if (Object.keys(found).length > 0) {
			// Send focus to the first invalid field so the failure is not silent.
			const first = document.getElementById(`contact-${Object.keys(found)[0]}`);
			first?.focus();
			return;
		}

		setSending(true);
		const subject = encodeURIComponent(form.subject.trim());
		const body = encodeURIComponent(
			`Name: ${form.name.trim()}\nEmail: ${form.email.trim()}\n\n${form.message.trim()}`,
		);
		window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;

		setForm(EMPTY);
		setErrors({});
		setSubmitted(true);
		window.setTimeout(() => {
			setSending(false);
			setSubmitted(false);
		}, 6000);
	};

	const filled = Object.values(form).filter((v) => v.trim()).length;

	return (
		<div className="pb-[var(--pf-section-y)]">
			<ProfessionalPageHeader
				label="Contact"
				title="Let's Build Something Meaningful"
				lede="Interested in collaborating on a project, discussing engineering challenges, or exploring new opportunities? I'm always open to meaningful conversations."
				regionLabel="Contact"
			/>

			<div className="pf-shell mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12">
				{/* Form */}
				<section
					className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8"
					aria-labelledby="contact-form-heading"
				>
					<h2
						id="contact-form-heading"
						className="font-heading text-lg font-semibold text-foreground"
					>
						Send a message
					</h2>
					<p className="mt-1.5 text-sm text-muted-foreground">
						This opens your email client with the message ready to send.
					</p>

					{/* Completion, announced politely rather than animated. */}
					<div className="mt-6">
						<div className="flex items-center justify-between font-mono text-[0.6875rem] text-muted-foreground">
							<span>{filled} of 4 fields filled</span>
							<span aria-hidden="true">{Math.round((filled / 4) * 100)}%</span>
						</div>
						<div
							role="progressbar"
							aria-label="Form completion"
							aria-valuenow={Math.round((filled / 4) * 100)}
							aria-valuemin={0}
							aria-valuemax={100}
							className="mt-2 h-1 overflow-hidden rounded-full bg-muted"
						>
							<div
								className="h-full rounded-full bg-primary transition-[width] duration-300"
								style={{ width: `${(filled / 4) * 100}%` }}
							/>
						</div>
					</div>

					{submitted ? (
						<p
							className="mt-6 flex items-start gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3.5 text-sm text-foreground"
							role="status"
						>
							<CheckCircle
								className="mt-0.5 h-4 w-4 shrink-0 text-primary"
								aria-hidden="true"
							/>
							Your email client should be open with the message ready to send.
						</p>
					) : null}

					<form onSubmit={submit} noValidate className="mt-7 space-y-5">
						<div className="grid gap-5 sm:grid-cols-2">
							<Field
								id="contact-name"
								label="Name"
								icon={<User className="h-4 w-4" aria-hidden="true" />}
								value={form.name}
								error={errors.name}
								autoComplete="name"
								placeholder="Your name"
								onChange={(v) => update("name", v)}
								onBlur={() => blur("name")}
							/>
							<Field
								id="contact-email"
								label="Email"
								type="email"
								icon={<Mail className="h-4 w-4" aria-hidden="true" />}
								value={form.email}
								error={errors.email}
								autoComplete="email"
								placeholder="you@example.com"
								onChange={(v) => update("email", v)}
								onBlur={() => blur("email")}
							/>
						</div>

						<Field
							id="contact-subject"
							label="Subject"
							icon={<MessageSquare className="h-4 w-4" aria-hidden="true" />}
							value={form.subject}
							error={errors.subject}
							placeholder="Collaboration, opportunity, or a question"
							onChange={(v) => update("subject", v)}
							onBlur={() => blur("subject")}
						/>

						<Field
							id="contact-message"
							label="Message"
							icon={null}
							multiline
							value={form.message}
							error={errors.message}
							placeholder="What are you working on?"
							onChange={(v) => update("message", v)}
							onBlur={() => blur("message")}
							hint={`${form.message.length}/1000`}
							maxLength={1000}
						/>

						<button
							type="submit"
							disabled={sending}
							className="pf-focus inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-[background-color,transform] duration-200 hover:bg-primary/90 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
						>
							{sending ? (
								<>
									<Loader2
										className="h-4 w-4 animate-spin"
										aria-hidden="true"
									/>
									Opening your email client…
								</>
							) : (
								<>
									<Send className="h-4 w-4" aria-hidden="true" />
									Send Message
								</>
							)}
						</button>
					</form>
				</section>

				{/* Direct channels */}
				<section className="space-y-6" aria-labelledby="contact-channels-heading">
					<div>
						<p className="pf-label">Direct</p>
						<h2
							id="contact-channels-heading"
							className="mt-3 font-heading text-lg font-semibold text-foreground"
						>
							Other ways to reach me
						</h2>
					</div>

					<ul className="space-y-1">
						<li>
							<a
								href={`mailto:${EMAIL}`}
								className="pf-focus group flex min-h-11 items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-200 hover:border-primary/50 hover:bg-accent"
							>
								<span
									className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary"
									aria-hidden="true"
								>
									<Mail className="h-4 w-4" strokeWidth={1.75} />
								</span>
								<span className="min-w-0">
									<span className="block text-xs text-muted-foreground">Email</span>
									<span className="block truncate text-sm text-foreground">
										{EMAIL}
									</span>
								</span>
							</a>
						</li>

						<li>
							<a
								href={RESUME_FILENAME}
								download
								className="pf-focus group flex min-h-11 items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-200 hover:border-primary/50 hover:bg-accent"
							>
								<span
									className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary"
									aria-hidden="true"
								>
									<FileText className="h-4 w-4" strokeWidth={1.75} />
								</span>
								<span className="min-w-0">
									<span className="block text-xs text-muted-foreground">Résumé</span>
									<span className="block text-sm text-foreground">
										Download PDF
									</span>
								</span>
							</a>
						</li>
					</ul>

					<div>
						<p className="pf-label">Elsewhere</p>
						<ul className="mt-4 flex flex-wrap gap-2.5">
							{socialLinks.map((social) => {
								const Icon = socialIcon(social.name);
								return (
									<li key={social.name}>
										<a
											href={social.url}
											target="_blank"
											rel="noopener noreferrer"
											aria-label={social.ariaLabel}
											className="pf-focus inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors duration-200 hover:border-primary/50 hover:bg-accent hover:text-accent-foreground"
										>
											{Icon ? (
												<Icon className="h-4 w-4" aria-hidden="true" />
											) : (
												<span className="text-xs font-semibold">
													{social.name}
												</span>
											)}
										</a>
									</li>
								);
							})}
						</ul>
					</div>
				</section>
			</div>
		</div>
	);
}

interface FieldProps {
	id: string;
	label: string;
	value: string;
	error?: string;
	icon: React.ReactNode;
	placeholder?: string;
	type?: string;
	multiline?: boolean;
	autoComplete?: string;
	hint?: string;
	maxLength?: number;
	onChange: (value: string) => void;
	onBlur: () => void;
}

function Field({
	id,
	label,
	value,
	error,
	icon,
	placeholder,
	type = "text",
	multiline = false,
	autoComplete,
	hint,
	maxLength,
	onChange,
	onBlur,
}: FieldProps) {
	const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
		.filter(Boolean)
		.join(" ");

	const base = `pf-focus w-full rounded-lg border bg-background px-3.5 text-[0.9375rem] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
		error ? "border-destructive" : "border-border hover:border-primary/40"
	}`;

	return (
		<div>
			<label
				htmlFor={id}
				className="flex items-center gap-2 text-sm font-medium text-foreground"
			>
				{icon ? <span className="text-primary">{icon}</span> : null}
				{label}
			</label>

			{multiline ? (
				<textarea
					id={id}
					value={value}
					rows={5}
					maxLength={maxLength}
					placeholder={placeholder}
					aria-invalid={error ? true : undefined}
					aria-describedby={describedBy || undefined}
					onChange={(e) => onChange(e.target.value)}
					onBlur={onBlur}
					className={`${base} mt-2 resize-y py-2.5 leading-relaxed`}
				/>
			) : (
				<input
					id={id}
					type={type}
					value={value}
					maxLength={maxLength}
					placeholder={placeholder}
					autoComplete={autoComplete}
					aria-invalid={error ? true : undefined}
					aria-describedby={describedBy || undefined}
					onChange={(e) => onChange(e.target.value)}
					onBlur={onBlur}
					className={`${base} mt-2 h-11`}
				/>
			)}

			{error ? (
				<p
					id={`${id}-error`}
					className="mt-1.5 flex items-center gap-1.5 text-[0.8125rem] text-destructive"
				>
					<AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
					{error}
				</p>
			) : null}

			{hint ? (
				<p
					id={`${id}-hint`}
					className="mt-1.5 text-right font-mono text-[0.6875rem] text-muted-foreground"
				>
					{hint}
				</p>
			) : null}
		</div>
	);
}