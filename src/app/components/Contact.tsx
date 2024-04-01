"use client";

const Contact = () => {
  return (
    <div className="flex justify-between items-center uppercase pt-10 sm:pb-10">
      <div className="w-[360px]">
        <div className="flex justify-between tracking-[0.5em]">
          <h2>Full</h2>
          <h2>Stack</h2>
        </div>

        <div className="flex justify-between pb-2 tracking-[0.7em]">
          <h2>developer</h2>
          <h2></h2>
        </div>

        <a href="tel:+447479227231">
          <div className="flex justify-between pb-3 tracking-[0.2em]">
            <h2>+447479</h2>
            <h2>227231</h2>
          </div>
        </a>

        <a href="mailto:curtisahuang@gmail.com">
          <div className="flex justify-between">
            <h2>curtisahuang</h2>
          </div>
          <div className="flex justify-between pb-2 tracking-[0.4em]">
            <h2>
              <span className="font-serif">@</span>
            </h2>
            <h2>gmail.com</h2>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Contact;
