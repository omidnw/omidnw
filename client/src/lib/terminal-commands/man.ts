import { TerminalState } from "@/components/CyberpunkTerminal/types";

// Manual pages database
const manPages: Record<
	string,
	{ name: string; section: number; description: string; content: string }
> = {
	ls: {
		name: "ls",
		section: 1,
		description: "list directory contents",
		content: `LS(1)                            User Commands                           LS(1)

NAME
       ls - list directory contents

SYNOPSIS
       ls [OPTION]... [FILE]...

DESCRIPTION
       List  information  about  the FILEs (the current directory by default).
       Sort entries alphabetically if none of -cftuvSUX nor --sort is specified.

       -a, --all
              do not ignore entries starting with .

       -l     use a long listing format

       -h, --human-readable
              with -l, print sizes like 1K 234M 2G etc.

       -R, --recursive
              list subdirectories recursively

       --help display this help and exit

EXAMPLES
       ls -la
              List all files in long format including hidden files

       ls -lh
              List files in long format with human-readable sizes

SEE ALSO
       cd(1), pwd(1)

Cyberpunk Linux 2077               December 2077                          LS(1)`,
	},

	cd: {
		name: "cd",
		section: 1,
		description: "change directory",
		content: `CD(1)                            User Commands                           CD(1)

NAME
       cd - change the current directory

SYNOPSIS
       cd [-L|-P] [directory]

DESCRIPTION
       Change the current directory to directory.

       -L     Force symbolic links to be followed. This is the default.

       -P     Use the physical directory structure without following symbolic links.

EXAMPLES
       cd
              Change to the home directory

       cd /projects
              Change to the /projects directory

       cd ..
              Change to the parent directory

       cd -
              Change to the previous directory

SEE ALSO
       pwd(1), ls(1)

Cyberpunk Linux 2077               December 2077                          CD(1)`,
	},

	ps: {
		name: "ps",
		section: 1,
		description: "report a snapshot of the current processes",
		content: `PS(1)                            User Commands                           PS(1)

NAME
       ps - report a snapshot of the current processes

SYNOPSIS
       ps [options]

DESCRIPTION
       ps displays information about a selection of the active processes.

       -A, -e
              Select all processes.

       -a     Select all processes with a tty except session leaders.

       -f     Full-format listing.

       -l     Long format.

       -u userlist
              User-oriented format.

       --help display this help and exit

EXAMPLES
       ps aux
              Show all processes in user format

       ps -ef
              Show all processes in full format

SEE ALSO
       top(1), kill(1)

Cyberpunk Linux 2077               December 2077                          PS(1)`,
	},

	top: {
		name: "top",
		section: 1,
		description: "display Linux processes",
		content: `TOP(1)                           User Commands                          TOP(1)

NAME
       top - display Linux processes

SYNOPSIS
       top [options]

DESCRIPTION
       The top program provides a dynamic real-time view of a running system.

       -h, --help
              Show help and exit.

       -n number
              Specify the maximum number of iterations.

       -u userlist
              Monitor only processes with a user id matching.

EXAMPLES
       top
              Display processes with default settings

       top -u omid
              Show only processes for user omid

SEE ALSO
       ps(1), kill(1)

Cyberpunk Linux 2077               December 2077                         TOP(1)`,
	},

	man: {
		name: "man",
		section: 1,
		description: "an interface to the on-line reference manuals",
		content: `MAN(1)                           User Commands                          MAN(1)

NAME
       man - an interface to the on-line reference manuals

SYNOPSIS
       man [OPTION...] [SECTION] PAGE...

DESCRIPTION
       man is the system's manual pager.

       -h, --help
              Print a help message and exit.

       -k, --apropos
              Search short manual page descriptions.

       -f, --whatis
              Display a short description.

EXAMPLES
       man ls
              Display the manual page for ls

       man -k copy
              Search for pages containing "copy"

SEE ALSO
       apropos(1), whatis(1)

Cyberpunk Linux 2077               December 2077                         MAN(1)`,
	},
};

/**
 * Display man command help
 */
const displayManHelp = (): string => {
	return `man: find and display manual pages

Usage: man [OPTION...] [SECTION] PAGE...

OPTIONS:
       -h, --help           display this help and exit
       -k, --apropos        search the short manual page descriptions
       -f, --whatis         display a short description
       -w, --where          print the location of manual pages

EXAMPLES:
       man ls               display the manual page for ls
       man 1 ls             display the manual page for ls from section 1
       man -k copy          search for manual pages containing "copy"

AVAILABLE MANUAL PAGES:
       ls(1)                list directory contents
       cd(1)                change directory
       ps(1)                report a snapshot of current processes
       top(1)               display Linux processes
       man(1)               interface to manual pages
       systemctl(1)         control systemd services
       neofetch(1)          system information tool
       shutdown(8)          halt, power-off or reboot the machine

For more information about a specific command, use: man <command>`;
};

/**
 * Handle man command
 */
export const handleManCommand = (args: string[]): string => {
	if (args.length === 0) {
		return "What manual page do you want?\nFor example, try 'man ls' or 'man --help'";
	}

	const firstArg = args[0];

	// Handle options
	if (firstArg === "-h" || firstArg === "--help") {
		return displayManHelp();
	}

	if (firstArg === "-k" || firstArg === "--apropos") {
		const searchTerm = args.slice(1).join(" ").toLowerCase();
		if (!searchTerm) {
			return "apropos what?\nUsage: man -k <search_term>";
		}

		const matches: string[] = [];
		Object.entries(manPages).forEach(([cmd, page]) => {
			if (
				cmd.includes(searchTerm) ||
				page.description.includes(searchTerm) ||
				page.content.toLowerCase().includes(searchTerm)
			) {
				matches.push(`${cmd}(${page.section}) - ${page.description}`);
			}
		});

		if (matches.length === 0) {
			return `${searchTerm}: nothing appropriate.`;
		}

		return matches.join("\n");
	}

	if (firstArg === "-f" || firstArg === "--whatis") {
		const commandName = args[1];
		if (!commandName) {
			return "whatis what?\nUsage: man -f <command>";
		}

		const page = manPages[commandName];
		if (!page) {
			return `${commandName}: nothing appropriate.`;
		}

		return `${commandName}(${page.section}) - ${page.description}`;
	}

	if (firstArg === "-w" || firstArg === "--where") {
		const commandName = args[1];
		if (!commandName) {
			return "man: option requires an argument -- 'w'";
		}

		const page = manPages[commandName];
		if (!page) {
			return `man: no manual entry for ${commandName}`;
		}

		return `/usr/share/man/man${page.section}/${commandName}.${page.section}.gz`;
	}

	// Handle section number
	let section: number | null = null;
	let commandName = firstArg;

	if (args.length >= 2 && /^\d+$/.test(firstArg)) {
		section = parseInt(firstArg);
		commandName = args[1];
	}

	// Look up the manual page
	const page = manPages[commandName];
	if (!page) {
		return `No manual entry for ${commandName}${
			section ? ` in section ${section}` : ""
		}
See 'man --help' for available manual pages.`;
	}

	// Check section if specified
	if (section && page.section !== section) {
		return `No manual entry for ${commandName} in section ${section}`;
	}

	// Return the manual page content
	return page.content;
};
