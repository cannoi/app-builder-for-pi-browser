# App Builder — Pi Browser

AI Builder that turns ideas into production-ready Pi Browser apps with Authentication, Payments and Ecosystem listing.

**Flow:** Idea → AI plan → Build → Safe Preview → External Browser / Pi Sandbox testing → Playwright → deployment-ready export.

The Builder does not access the host Docker daemon and does not require a Docker socket. Local preview is not a substitute for real Pi Sandbox authentication or payment testing. Pi login and payments must be verified in the external Pi Sandbox; production requires explicit configuration and approval.

## Start

Run the Builder as a normal Pi Browser app. Preview does not require Docker daemon access.


## Template Library (v1.8.32)

Open **Templates** in the header to browse the 146-entry catalog, search/filter by 15
categories, and describe an app idea for deterministic template matching. The catalog
distinguishes editable source, Docker package metadata, and reference-only entries.

Only a verified local source template can be copied into a new Builder project. Selecting
a source template queues the existing Improve workflow with the user's requested idea.
Docker package/reference entries remain recommendations until their real upstream image,
ports, environment variables, persistent storage, and Pi Browser deployment manifest are verified.
See [TEMPLATE_LIBRARY.md](TEMPLATE_LIBRARY.md).
