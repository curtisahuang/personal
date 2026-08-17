"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useState, type ReactNode } from "react";

type ContactFormDrawerProps = {
  triggerLabel?: ReactNode;
  triggerClassName?: string;
  title?: string;
  description?: string;
};

const ContactFormDrawer = ({
  triggerLabel = "Send a message",
  triggerClassName = "",
  title = "Send a message",
  description = "Share a few details and I will get back to you.",
}: ContactFormDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => setIsOpen(true)}>
        {triggerLabel}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="contact-form-overlay"
            className="fixed inset-0 z-50 flex justify-end overflow-hidden overscroll-none bg-black/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              className="ml-auto flex h-full w-full max-w-xl flex-col overflow-y-auto bg-[#fffaf0] px-6 py-6 text-[#171713] shadow-2xl sm:px-8 sm:py-8"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-8 flex items-start justify-between gap-6">
                <div>
                  <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#845b3d]">
                    Contact form
                  </p>
                  <h2
                    id={titleId}
                    className="text-4xl font-medium tracking-[-0.03em] text-[#171713]"
                  >
                    {title}
                  </h2>
                  <p id={descriptionId} className="mt-3 max-w-md text-sm leading-6 text-[#5f5a52]">
                    {description}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close contact form"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d8d0c3] text-2xl leading-none transition hover:border-[#845b3d] hover:text-[#845b3d]"
                  onClick={() => setIsOpen(false)}
                >
                  ×
                </button>
              </div>

              <form
                action="https://formsubmit.co/curtisahuang@gmail.com"
                method="POST"
                className="flex flex-1 flex-col gap-5"
              >
                <input type="hidden" name="_captcha" value="false" />
                <input
                  type="hidden"
                  name="_subject"
                  value="New teaching inquiry from curtisahuang.com"
                />
                <input type="hidden" name="_template" value="table" />

                <label className="flex flex-col gap-2 text-sm font-medium uppercase tracking-[0.12em] text-[#5f5a52]">
                  Email *
                  <input
                    type="email"
                    name="email"
                    required
                    className="rounded-none border border-[#d8d0c3] bg-white px-4 py-3 text-base normal-case tracking-normal text-[#171713] outline-none transition placeholder:text-[#9d968b] focus:border-[#845b3d]"
                    placeholder="you@example.com"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium uppercase tracking-[0.12em] text-[#5f5a52]">
                  Phone number
                  <input
                    type="tel"
                    name="phone"
                    className="rounded-none border border-[#d8d0c3] bg-white px-4 py-3 text-base normal-case tracking-normal text-[#171713] outline-none transition placeholder:text-[#9d968b] focus:border-[#845b3d]"
                    placeholder="Optional"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium uppercase tracking-[0.12em] text-[#5f5a52]">
                  Subjects
                  <input
                    type="text"
                    name="subjects"
                    className="rounded-none border border-[#d8d0c3] bg-white px-4 py-3 text-base normal-case tracking-normal text-[#171713] outline-none transition placeholder:text-[#9d968b] focus:border-[#845b3d]"
                    placeholder="Biology, mathematics, programming..."
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium uppercase tracking-[0.12em] text-[#5f5a52]">
                  Age or Grade of student
                  <input
                    type="text"
                    name="student_age"
                    className="rounded-none border border-[#d8d0c3] bg-white px-4 py-3 text-base normal-case tracking-normal text-[#171713] outline-none transition placeholder:text-[#9d968b] focus:border-[#845b3d]"
                    placeholder="Optional"
                  />
                </label>

                <label className="flex flex-1 flex-col gap-2 text-sm font-medium uppercase tracking-[0.12em] text-[#5f5a52]">
                  Message *
                  <textarea
                    name="message"
                    required
                    rows={7}
                    className="min-h-40 flex-1 resize-y rounded-none border border-[#d8d0c3] bg-white px-4 py-3 text-base normal-case tracking-normal text-[#171713] outline-none transition placeholder:text-[#9d968b] focus:border-[#845b3d]"
                    placeholder="Tell me about the student, goals, timing, and anything else I should know."
                  />
                </label>

                <div className="mt-2 flex items-center justify-between gap-4 border-t border-[#e7e0d5] pt-5">
                  <p className="text-sm text-[#5f5a52]">
                    Required fields are marked with *. <br />
                    This form uses a third-party library FormSubmit, so please do not send any
                    sensitive information.
                  </p>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center border border-[#171713] bg-[#171713] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#fffaf0] transition hover:bg-[#845b3d] hover:border-[#845b3d]"
                  >
                    Send
                  </button>
                </div>
              </form>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default ContactFormDrawer;
