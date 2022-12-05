import {
  delay,
  getBySelector,
  setEndOfContenteditable,
  updateEventFieldFromFrontend,
} from "../src/frontend-utils";
import { EventField, EventSQL } from "../src/common-interfaces";
import Linkify from "linkify-react";

/**
Create a text field that also has an edit button. Uses contenteditable for editing and
[Linkify](https://linkify.js.org/) for adding links.
*/

export function EditableTextfield({
  headingText,
  fieldName,
  event,
  placeholder,
  className,
  prefix,
  allowNewlines,
  linkify,
}: {
  headingText: string;
  fieldName: EventField;
  event: EventSQL;
  placeholder?: string;
  className?: string;
  prefix?: string;
  allowNewlines?: boolean;
  /** Automatically turn text that looks like a link into a link */
  linkify?: boolean;
}) {
  let oldValue = headingText;

  const toggleEditSave = async (fieldName: EventField) => {
    const textEle = getBySelector<HTMLHeadingElement>(`.${fieldName}`);
    const button = getBySelector<HTMLButtonElement>(`.button-${fieldName}`);
    const isEditing = textEle.isContentEditable;

    if (isEditing === false) {
      oldValue = textEle.innerText;
      textEle.contentEditable = "true";
      button.innerText = "Save";
      setTimeout(function () {
        textEle.focus();
        setEndOfContenteditable(textEle);
      }, 0);
    } else {
      const newValue = textEle.innerText.trim();
      // Go straight back to edit if text not changed
      if (newValue === oldValue) {
        textEle.contentEditable = "false";
        button.innerHTML = "Edit";
        return;
      }

      textEle.contentEditable = "false";
      button.disabled = true;
      button.innerHTML = "Saving...";
      textEle.innerText = newValue; // Remove trailing spaces if need be

      await updateEventFieldFromFrontend({
        eventId: event.id,
        field: fieldName,
        value: newValue,
      });

      button.innerHTML = "Saved";
      await delay(1000);
      button.disabled = false;
      button.innerHTML = "Edit";
    }
  };

  const headingOrPlaceholder =
    headingText.length === 0 && placeholder !== undefined
      ? placeholder
      : headingText;
  return (
    <div className="editable-event-heading">
      <h2>
        <span>{prefix}</span>
        <div
          style={{ display: "inline-block" }}
          className={`content ${className} ${fieldName} editable`}
          onBlur={async () => {
            const heading = getBySelector<HTMLHeadingElement>(`.${fieldName}`);
            if (heading.isContentEditable) {
              await toggleEditSave(fieldName);
            }
          }}
          onKeyDown={async (evt) => {
            if (evt.key === "Enter" && allowNewlines !== true) {
              evt.preventDefault();
              await toggleEditSave(fieldName);
            }
          }}
        >
          {linkify ? (
            <Linkify
              as="p"
              options={{
                target: "_blank", // Open all links in new tab
              }}
            >
              {headingOrPlaceholder}
            </Linkify>
          ) : (
            headingOrPlaceholder
          )}
        </div>
      </h2>
      <button
        className={`button-${fieldName}`}
        onClick={() => toggleEditSave(fieldName)}
      >
        Edit
      </button>
      <br></br>
    </div>
  );
}
