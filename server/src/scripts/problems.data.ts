// Generated from verified reference solutions — expected outputs are computed, not typed by hand.
// Re-seeding is safe: problems are upserted by slug.

export interface SeedProblem {
  title: string
  slug: string
  difficulty: "easy" | "medium" | "hard"
  tags: string[]
  companies: string[]
  description: string
  examples: { input: string; output: string; explanation?: string }[]
  testCases: { input: string; expectedOutput: string; isHidden: boolean }[]
  hints: string[]
  solution: string
  starterCode: { javascript: string; python: string; java: string; cpp: string }
}

export const SEED_PROBLEMS: SeedProblem[] = [
  {
    "title": "Two Sum",
    "slug": "two-sum",
    "difficulty": "easy",
    "tags": [
      "array",
      "hashing"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ],
    "description": "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`.\n\nExactly one valid pair exists, and you may not use the same element twice. Print the smaller index first.\n\nConstraints:\n- 2 <= nums.length <= 10^4\n- -10^9 <= nums[i], target <= 10^9\n- Exactly one solution exists\n\nInput format (stdin): Line 1: n. Line 2: the n integers. Line 3: target.\nOutput format (stdout): Two indices separated by a space.\nYou only need to complete the `solve` function; the input handling is already written for you.",
    "examples": [
      {
        "input": "nums = [2, 7, 11, 15], target = 9",
        "output": "0 1",
        "explanation": "nums[0] + nums[1] = 2 + 7 = 9, so we return 0 and 1."
      },
      {
        "input": "nums = [3, 2, 4], target = 6",
        "output": "1 2",
        "explanation": "nums[1] + nums[2] = 2 + 4 = 6."
      }
    ],
    "testCases": [
      {
        "input": "4\n2 7 11 15\n9\n",
        "expectedOutput": "0 1\n",
        "isHidden": false
      },
      {
        "input": "3\n3 2 4\n6\n",
        "expectedOutput": "1 2\n",
        "isHidden": false
      },
      {
        "input": "2\n3 3\n6\n",
        "expectedOutput": "0 1\n",
        "isHidden": false
      },
      {
        "input": "6\n0 -11 5 21 -17 -16\n-17\n",
        "expectedOutput": "0 4\n",
        "isHidden": true
      },
      {
        "input": "9\n3 17 -17 12 -7 -18 -15 7 6\n29\n",
        "expectedOutput": "1 3\n",
        "isHidden": true
      },
      {
        "input": "4\n-3 4 3 90\n0\n",
        "expectedOutput": "0 2\n",
        "isHidden": true
      }
    ],
    "hints": [
      "A brute force checks every pair in O(n^2). Can you do it in one pass?",
      "For each number x, you need target - x. How can you look it up in O(1)?"
    ],
    "solution": "Single pass with a hash map from value to index. For each x, check whether target - x was seen; otherwise store x. Time O(n), space O(n).",
    "starterCode": {
      "javascript": "function solve(nums, target) {\n  // Write your solution here\n  return [0, 0];\n}\n\n// --- input handling: you don't need to change anything below ---\nconst lines = require(\"fs\").readFileSync(0, \"utf8\").split(\"\\n\");\nconst nums = (lines[1] || \"\").trim() ? lines[1].trim().split(/\\s+/).map(Number) : [];\nconst target = Number(lines[2]);\nconst result = solve(nums, target);\nconsole.log(result.join(\" \"));\n",
      "python": "import sys\n\n\ndef solve(nums, target):\n    # Write your solution here\n    return [0, 0]\n\n\n# --- input handling: you don't need to change anything below ---\nlines = sys.stdin.read().split(\"\\n\")\nnums = list(map(int, lines[1].split())) if len(lines) > 1 else []\ntarget = int(lines[2])\nresult = solve(nums, target)\nprint(*result)\n",
      "java": "import java.util.*;\n\npublic class Main {\n    static int[] solve(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{0, 0};\n    }\n\n    // --- input handling: you don't need to change anything below ---\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        int target = sc.nextInt();\n        int[] result = solve(nums, target);\n        System.out.println(result[0] + \" \" + result[1]);\n    }\n}\n",
      "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nvector<int> solve(vector<int>& nums, int target) {\n    // Write your solution here\n    return {0, 0};\n}\n\n// --- input handling: you don't need to change anything below ---\nint main() {\n    int n;\n    cin >> n;\n    vector<int> nums(n);\n    for (auto& x : nums) cin >> x;\n    int target;\n    cin >> target;\n    auto result = solve(nums, target);\n    cout << result[0] << \" \" << result[1] << endl;\n    return 0;\n}\n"
    }
  },
  {
    "title": "Valid Parentheses",
    "slug": "valid-parentheses",
    "difficulty": "easy",
    "tags": [
      "stack",
      "string"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Bloomberg"
    ],
    "description": "Given a string `s` containing only the characters `(`, `)`, `{`, `}`, `[` and `]`, determine whether the input is valid.\n\nA string is valid when every open bracket is closed by the same type of bracket, and in the correct order.\n\nConstraints:\n- 1 <= s.length <= 10^4\n- s consists only of ()[]{}\n\nInput format (stdin): A single line containing the string.\nOutput format (stdout): `true` or `false`.\nYou only need to complete the `solve` function; the input handling is already written for you.",
    "examples": [
      {
        "input": "s = \"()\"",
        "output": "true",
        "explanation": "Every bracket is closed in the right order."
      },
      {
        "input": "s = \"()[]{}\"",
        "output": "true",
        "explanation": "Each pair is opened and closed correctly."
      }
    ],
    "testCases": [
      {
        "input": "()\n",
        "expectedOutput": "true\n",
        "isHidden": false
      },
      {
        "input": "()[]{}\n",
        "expectedOutput": "true\n",
        "isHidden": false
      },
      {
        "input": "(]\n",
        "expectedOutput": "false\n",
        "isHidden": false
      },
      {
        "input": "([{}])\n",
        "expectedOutput": "true\n",
        "isHidden": true
      },
      {
        "input": "((\n",
        "expectedOutput": "false\n",
        "isHidden": true
      },
      {
        "input": "{[(])}\n",
        "expectedOutput": "false\n",
        "isHidden": true
      },
      {
        "input": "]\n",
        "expectedOutput": "false\n",
        "isHidden": true
      }
    ],
    "hints": [
      "The most recently opened bracket must be the first one closed.",
      "Which data structure gives you last-in, first-out?"
    ],
    "solution": "Push opening brackets on a stack; on a closing bracket, the stack top must be its match. The string is valid when the stack ends empty. O(n).",
    "starterCode": {
      "javascript": "function solve(s) {\n  // Write your solution here\n  return false;\n}\n\n// --- input handling: you don't need to change anything below ---\nconst lines = require(\"fs\").readFileSync(0, \"utf8\").split(\"\\n\");\nconst s = (lines[0] || \"\").replace(/\\r$/, \"\");\nconst result = solve(s);\nconsole.log(String(result));\n",
      "python": "import sys\n\n\ndef solve(s):\n    # Write your solution here\n    return False\n\n\n# --- input handling: you don't need to change anything below ---\nlines = sys.stdin.read().split(\"\\n\")\ns = lines[0].rstrip(\"\\r\")\nresult = solve(s)\nprint(str(result).lower())\n",
      "java": "import java.util.*;\n\npublic class Main {\n    static boolean solve(String s) {\n        // Write your solution here\n        return false;\n    }\n\n    // --- input handling: you don't need to change anything below ---\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNextLine() ? sc.nextLine() : \"\";\n        boolean result = solve(s);\n        System.out.println(result);\n    }\n}\n",
      "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nbool solve(const string& s) {\n    // Write your solution here\n    return false;\n}\n\n// --- input handling: you don't need to change anything below ---\nint main() {\n    string s;\n    getline(cin, s);\n    if (!s.empty() && s.back() == '\\r') s.pop_back();\n    auto result = solve(s);\n    cout << (result ? \"true\" : \"false\") << endl;\n    return 0;\n}\n"
    }
  },
  {
    "title": "Best Time to Buy and Sell Stock",
    "slug": "best-time-to-buy-and-sell-stock",
    "difficulty": "easy",
    "tags": [
      "array",
      "greedy"
    ],
    "companies": [
      "Amazon",
      "Meta",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "description": "`prices[i]` is the price of a stock on day `i`. Choose one day to buy and a later day to sell to maximise profit.\n\nReturn the maximum profit, or `0` if no profit is possible.\n\nConstraints:\n- 1 <= prices.length <= 10^5\n- 0 <= prices[i] <= 10^4\n\nInput format (stdin): Line 1: n (length of the array). Line 2: the n integers.\nOutput format (stdout): A single integer.\nYou only need to complete the `solve` function; the input handling is already written for you.",
    "examples": [
      {
        "input": "nums = [7, 1, 5, 3, 6, 4]",
        "output": "5",
        "explanation": "Buy at 1, sell at 6: profit 5."
      },
      {
        "input": "nums = [7, 6, 4, 3, 1]",
        "output": "0",
        "explanation": "Prices only fall, so the best profit is 0."
      }
    ],
    "testCases": [
      {
        "input": "6\n7 1 5 3 6 4\n",
        "expectedOutput": "5\n",
        "isHidden": false
      },
      {
        "input": "5\n7 6 4 3 1\n",
        "expectedOutput": "0\n",
        "isHidden": false
      },
      {
        "input": "3\n2 4 1\n",
        "expectedOutput": "2\n",
        "isHidden": false
      },
      {
        "input": "1\n5\n",
        "expectedOutput": "0\n",
        "isHidden": true
      },
      {
        "input": "12\n6 36 28 4 37 8 15 41 41 38 4 37\n",
        "expectedOutput": "37\n",
        "isHidden": true
      },
      {
        "input": "7\n1 2 3 4 5 0 10\n",
        "expectedOutput": "10\n",
        "isHidden": true
      }
    ],
    "hints": [
      "Track the cheapest price seen so far.",
      "At each day, the best sale is price - cheapest_so_far."
    ],
    "solution": "One pass keeping the minimum price so far and the best difference. O(n) time, O(1) space.",
    "starterCode": {
      "javascript": "function solve(nums) {\n  // Write your solution here\n  return 0;\n}\n\n// --- input handling: you don't need to change anything below ---\nconst lines = require(\"fs\").readFileSync(0, \"utf8\").split(\"\\n\");\nconst nums = (lines[1] || \"\").trim() ? lines[1].trim().split(/\\s+/).map(Number) : [];\nconst result = solve(nums);\nconsole.log(String(result));\n",
      "python": "import sys\n\n\ndef solve(nums):\n    # Write your solution here\n    return 0\n\n\n# --- input handling: you don't need to change anything below ---\nlines = sys.stdin.read().split(\"\\n\")\nnums = list(map(int, lines[1].split())) if len(lines) > 1 else []\nresult = solve(nums)\nprint(result)\n",
      "java": "import java.util.*;\n\npublic class Main {\n    static int solve(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n\n    // --- input handling: you don't need to change anything below ---\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        int result = solve(nums);\n        System.out.println(result);\n    }\n}\n",
      "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nint solve(vector<int>& nums) {\n    // Write your solution here\n    return 0;\n}\n\n// --- input handling: you don't need to change anything below ---\nint main() {\n    int n;\n    cin >> n;\n    vector<int> nums(n);\n    for (auto& x : nums) cin >> x;\n    auto result = solve(nums);\n    cout << result << endl;\n    return 0;\n}\n"
    }
  },
  {
    "title": "Maximum Subarray",
    "slug": "maximum-subarray",
    "difficulty": "medium",
    "tags": [
      "array",
      "dynamic-programming"
    ],
    "companies": [
      "Amazon",
      "Microsoft",
      "Apple",
      "LinkedIn"
    ],
    "description": "Given an integer array `nums`, find the contiguous subarray with the largest sum and return that sum.\n\nConstraints:\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4\n\nInput format (stdin): Line 1: n (length of the array). Line 2: the n integers.\nOutput format (stdout): A single integer.\nYou only need to complete the `solve` function; the input handling is already written for you.",
    "examples": [
      {
        "input": "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
        "output": "6",
        "explanation": "The subarray [4, -1, 2, 1] has the largest sum, 6."
      },
      {
        "input": "nums = [1]",
        "output": "1",
        "explanation": "A single element is its own best subarray."
      }
    ],
    "testCases": [
      {
        "input": "9\n-2 1 -3 4 -1 2 1 -5 4\n",
        "expectedOutput": "6\n",
        "isHidden": false
      },
      {
        "input": "1\n1\n",
        "expectedOutput": "1\n",
        "isHidden": false
      },
      {
        "input": "5\n5 4 -1 7 8\n",
        "expectedOutput": "23\n",
        "isHidden": false
      },
      {
        "input": "3\n-3 -1 -2\n",
        "expectedOutput": "-1\n",
        "isHidden": true
      },
      {
        "input": "14\n9 3 -8 -2 -8 8 -5 0 4 -5 8 -6 9 0\n",
        "expectedOutput": "13\n",
        "isHidden": true
      },
      {
        "input": "20\n12 0 -2 1 6 -2 12 -3 -4 1 10 12 8 5 9 9 6 4 2 0\n",
        "expectedOutput": "86\n",
        "isHidden": true
      }
    ],
    "hints": [
      "Decide at each element: extend the previous subarray or start fresh.",
      "Keep the best sum ending at the current index."
    ],
    "solution": "Kadane's algorithm: cur = max(x, cur + x); best = max(best, cur). O(n) time, O(1) space.",
    "starterCode": {
      "javascript": "function solve(nums) {\n  // Write your solution here\n  return 0;\n}\n\n// --- input handling: you don't need to change anything below ---\nconst lines = require(\"fs\").readFileSync(0, \"utf8\").split(\"\\n\");\nconst nums = (lines[1] || \"\").trim() ? lines[1].trim().split(/\\s+/).map(Number) : [];\nconst result = solve(nums);\nconsole.log(String(result));\n",
      "python": "import sys\n\n\ndef solve(nums):\n    # Write your solution here\n    return 0\n\n\n# --- input handling: you don't need to change anything below ---\nlines = sys.stdin.read().split(\"\\n\")\nnums = list(map(int, lines[1].split())) if len(lines) > 1 else []\nresult = solve(nums)\nprint(result)\n",
      "java": "import java.util.*;\n\npublic class Main {\n    static int solve(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n\n    // --- input handling: you don't need to change anything below ---\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        int result = solve(nums);\n        System.out.println(result);\n    }\n}\n",
      "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nint solve(vector<int>& nums) {\n    // Write your solution here\n    return 0;\n}\n\n// --- input handling: you don't need to change anything below ---\nint main() {\n    int n;\n    cin >> n;\n    vector<int> nums(n);\n    for (auto& x : nums) cin >> x;\n    auto result = solve(nums);\n    cout << result << endl;\n    return 0;\n}\n"
    }
  },
  {
    "title": "Binary Search",
    "slug": "binary-search",
    "difficulty": "easy",
    "tags": [
      "binary-search",
      "array"
    ],
    "companies": [
      "Microsoft",
      "Amazon",
      "Adobe"
    ],
    "description": "Given an array `nums` sorted in ascending order and an integer `target`, return the index of `target` in `nums`, or `-1` if it is not present.\n\nYour solution must run in O(log n) time.\n\nConstraints:\n- 1 <= nums.length <= 10^4\n- All values in nums are distinct and sorted ascending\n\nInput format (stdin): Line 1: n. Line 2: the n integers. Line 3: target.\nOutput format (stdout): A single integer.\nYou only need to complete the `solve` function; the input handling is already written for you.",
    "examples": [
      {
        "input": "nums = [-1, 0, 3, 5, 9, 12], target = 9",
        "output": "4",
        "explanation": "9 exists at index 4."
      },
      {
        "input": "nums = [-1, 0, 3, 5, 9, 12], target = 2",
        "output": "-1",
        "explanation": "2 is not in the array, so the answer is -1."
      }
    ],
    "testCases": [
      {
        "input": "6\n-1 0 3 5 9 12\n9\n",
        "expectedOutput": "4\n",
        "isHidden": false
      },
      {
        "input": "6\n-1 0 3 5 9 12\n2\n",
        "expectedOutput": "-1\n",
        "isHidden": false
      },
      {
        "input": "1\n5\n5\n",
        "expectedOutput": "0\n",
        "isHidden": false
      },
      {
        "input": "7\n1 3 5 7 9 11 13\n13\n",
        "expectedOutput": "6\n",
        "isHidden": true
      },
      {
        "input": "7\n1 3 5 7 9 11 13\n1\n",
        "expectedOutput": "0\n",
        "isHidden": true
      },
      {
        "input": "4\n2 4 6 8\n7\n",
        "expectedOutput": "-1\n",
        "isHidden": true
      }
    ],
    "hints": [
      "Compare the target with the middle element and discard half the array.",
      "Watch your loop condition: lo <= hi."
    ],
    "solution": "Classic binary search with lo/hi pointers, halving the range each step. O(log n).",
    "starterCode": {
      "javascript": "function solve(nums, target) {\n  // Write your solution here\n  return 0;\n}\n\n// --- input handling: you don't need to change anything below ---\nconst lines = require(\"fs\").readFileSync(0, \"utf8\").split(\"\\n\");\nconst nums = (lines[1] || \"\").trim() ? lines[1].trim().split(/\\s+/).map(Number) : [];\nconst target = Number(lines[2]);\nconst result = solve(nums, target);\nconsole.log(String(result));\n",
      "python": "import sys\n\n\ndef solve(nums, target):\n    # Write your solution here\n    return 0\n\n\n# --- input handling: you don't need to change anything below ---\nlines = sys.stdin.read().split(\"\\n\")\nnums = list(map(int, lines[1].split())) if len(lines) > 1 else []\ntarget = int(lines[2])\nresult = solve(nums, target)\nprint(result)\n",
      "java": "import java.util.*;\n\npublic class Main {\n    static int solve(int[] nums, int target) {\n        // Write your solution here\n        return 0;\n    }\n\n    // --- input handling: you don't need to change anything below ---\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        int target = sc.nextInt();\n        int result = solve(nums, target);\n        System.out.println(result);\n    }\n}\n",
      "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nint solve(vector<int>& nums, int target) {\n    // Write your solution here\n    return 0;\n}\n\n// --- input handling: you don't need to change anything below ---\nint main() {\n    int n;\n    cin >> n;\n    vector<int> nums(n);\n    for (auto& x : nums) cin >> x;\n    int target;\n    cin >> target;\n    auto result = solve(nums, target);\n    cout << result << endl;\n    return 0;\n}\n"
    }
  },
  {
    "title": "Climbing Stairs",
    "slug": "climbing-stairs",
    "difficulty": "easy",
    "tags": [
      "dynamic-programming",
      "math"
    ],
    "companies": [
      "Amazon",
      "Adobe",
      "Apple"
    ],
    "description": "You are climbing a staircase with `n` steps. Each move you can climb 1 or 2 steps.\n\nReturn the number of distinct ways to reach the top.\n\nConstraints:\n- 1 <= n <= 45\n\nInput format (stdin): A single integer n.\nOutput format (stdout): A single integer.\nYou only need to complete the `solve` function; the input handling is already written for you.",
    "examples": [
      {
        "input": "n = 2",
        "output": "2",
        "explanation": "Two ways: 1+1 or 2."
      },
      {
        "input": "n = 3",
        "output": "3",
        "explanation": "Three ways: 1+1+1, 1+2, 2+1."
      }
    ],
    "testCases": [
      {
        "input": "2\n",
        "expectedOutput": "2\n",
        "isHidden": false
      },
      {
        "input": "3\n",
        "expectedOutput": "3\n",
        "isHidden": false
      },
      {
        "input": "1\n",
        "expectedOutput": "1\n",
        "isHidden": false
      },
      {
        "input": "5\n",
        "expectedOutput": "8\n",
        "isHidden": true
      },
      {
        "input": "10\n",
        "expectedOutput": "89\n",
        "isHidden": true
      },
      {
        "input": "45\n",
        "expectedOutput": "1836311903\n",
        "isHidden": true
      }
    ],
    "hints": [
      "To reach step n you came from step n-1 or n-2.",
      "That is the Fibonacci recurrence."
    ],
    "solution": "ways(n) = ways(n-1) + ways(n-2). Keep only the last two values: O(n) time, O(1) space.",
    "starterCode": {
      "javascript": "function solve(n) {\n  // Write your solution here\n  return 0;\n}\n\n// --- input handling: you don't need to change anything below ---\nconst lines = require(\"fs\").readFileSync(0, \"utf8\").split(\"\\n\");\nconst n = Number(lines[0]);\nconst result = solve(n);\nconsole.log(String(result));\n",
      "python": "import sys\n\n\ndef solve(n):\n    # Write your solution here\n    return 0\n\n\n# --- input handling: you don't need to change anything below ---\nlines = sys.stdin.read().split(\"\\n\")\nn = int(lines[0])\nresult = solve(n)\nprint(result)\n",
      "java": "import java.util.*;\n\npublic class Main {\n    static int solve(int n) {\n        // Write your solution here\n        return 0;\n    }\n\n    // --- input handling: you don't need to change anything below ---\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int result = solve(n);\n        System.out.println(result);\n    }\n}\n",
      "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nint solve(int n) {\n    // Write your solution here\n    return 0;\n}\n\n// --- input handling: you don't need to change anything below ---\nint main() {\n    int n;\n    cin >> n;\n    auto result = solve(n);\n    cout << result << endl;\n    return 0;\n}\n"
    }
  },
  {
    "title": "Contains Duplicate",
    "slug": "contains-duplicate",
    "difficulty": "easy",
    "tags": [
      "array",
      "hashing",
      "sorting"
    ],
    "companies": [
      "Apple",
      "Amazon",
      "Microsoft"
    ],
    "description": "Given an integer array `nums`, return `true` if any value appears at least twice, and `false` if every element is distinct.\n\nConstraints:\n- 1 <= nums.length <= 10^5\n- -10^9 <= nums[i] <= 10^9\n\nInput format (stdin): Line 1: n (length of the array). Line 2: the n integers.\nOutput format (stdout): `true` or `false`.\nYou only need to complete the `solve` function; the input handling is already written for you.",
    "examples": [
      {
        "input": "nums = [1, 2, 3, 1]",
        "output": "true",
        "explanation": "1 appears twice."
      },
      {
        "input": "nums = [1, 2, 3, 4]",
        "output": "false",
        "explanation": "All elements are distinct."
      }
    ],
    "testCases": [
      {
        "input": "4\n1 2 3 1\n",
        "expectedOutput": "true\n",
        "isHidden": false
      },
      {
        "input": "4\n1 2 3 4\n",
        "expectedOutput": "false\n",
        "isHidden": false
      },
      {
        "input": "10\n1 1 1 3 3 4 3 2 4 2\n",
        "expectedOutput": "true\n",
        "isHidden": false
      },
      {
        "input": "1\n7\n",
        "expectedOutput": "false\n",
        "isHidden": true
      },
      {
        "input": "12\n89 99 31 10 73 38 67 63 43 93 57 36\n",
        "expectedOutput": "false\n",
        "isHidden": true
      },
      {
        "input": "3\n5 9 5\n",
        "expectedOutput": "true\n",
        "isHidden": true
      }
    ],
    "hints": [
      "Remembering what you have already seen makes this a single pass."
    ],
    "solution": "Insert into a hash set; if an element is already present, return true. O(n) time, O(n) space.",
    "starterCode": {
      "javascript": "function solve(nums) {\n  // Write your solution here\n  return false;\n}\n\n// --- input handling: you don't need to change anything below ---\nconst lines = require(\"fs\").readFileSync(0, \"utf8\").split(\"\\n\");\nconst nums = (lines[1] || \"\").trim() ? lines[1].trim().split(/\\s+/).map(Number) : [];\nconst result = solve(nums);\nconsole.log(String(result));\n",
      "python": "import sys\n\n\ndef solve(nums):\n    # Write your solution here\n    return False\n\n\n# --- input handling: you don't need to change anything below ---\nlines = sys.stdin.read().split(\"\\n\")\nnums = list(map(int, lines[1].split())) if len(lines) > 1 else []\nresult = solve(nums)\nprint(str(result).lower())\n",
      "java": "import java.util.*;\n\npublic class Main {\n    static boolean solve(int[] nums) {\n        // Write your solution here\n        return false;\n    }\n\n    // --- input handling: you don't need to change anything below ---\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        boolean result = solve(nums);\n        System.out.println(result);\n    }\n}\n",
      "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nbool solve(vector<int>& nums) {\n    // Write your solution here\n    return false;\n}\n\n// --- input handling: you don't need to change anything below ---\nint main() {\n    int n;\n    cin >> n;\n    vector<int> nums(n);\n    for (auto& x : nums) cin >> x;\n    auto result = solve(nums);\n    cout << (result ? \"true\" : \"false\") << endl;\n    return 0;\n}\n"
    }
  },
  {
    "title": "Longest Substring Without Repeating Characters",
    "slug": "longest-substring-without-repeating-characters",
    "difficulty": "medium",
    "tags": [
      "string",
      "sliding-window",
      "hashing"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Adobe",
      "Bloomberg"
    ],
    "description": "Given a string `s`, return the length of the longest substring that contains no repeating characters.\n\nConstraints:\n- 1 <= s.length <= 5 * 10^4\n- s consists of English letters, digits, symbols and spaces\n\nInput format (stdin): A single line containing the string.\nOutput format (stdout): A single integer.\nYou only need to complete the `solve` function; the input handling is already written for you.",
    "examples": [
      {
        "input": "s = \"abcabcbb\"",
        "output": "3",
        "explanation": "The answer is \"abc\", with length 3."
      },
      {
        "input": "s = \"bbbbb\"",
        "output": "1",
        "explanation": "The answer is \"b\", with length 1."
      }
    ],
    "testCases": [
      {
        "input": "abcabcbb\n",
        "expectedOutput": "3\n",
        "isHidden": false
      },
      {
        "input": "bbbbb\n",
        "expectedOutput": "1\n",
        "isHidden": false
      },
      {
        "input": "pwwkew\n",
        "expectedOutput": "3\n",
        "isHidden": false
      },
      {
        "input": "a\n",
        "expectedOutput": "1\n",
        "isHidden": true
      },
      {
        "input": "dvdf\n",
        "expectedOutput": "3\n",
        "isHidden": true
      },
      {
        "input": "abba\n",
        "expectedOutput": "2\n",
        "isHidden": true
      },
      {
        "input": "tmmzuxt\n",
        "expectedOutput": "5\n",
        "isHidden": true
      }
    ],
    "hints": [
      "Maintain a window [start, i] that has no duplicates.",
      "When you see a repeat, move start just past its previous position."
    ],
    "solution": "Sliding window with a map of last-seen indices. Jump `start` past the earlier duplicate. O(n) time.",
    "starterCode": {
      "javascript": "function solve(s) {\n  // Write your solution here\n  return 0;\n}\n\n// --- input handling: you don't need to change anything below ---\nconst lines = require(\"fs\").readFileSync(0, \"utf8\").split(\"\\n\");\nconst s = (lines[0] || \"\").replace(/\\r$/, \"\");\nconst result = solve(s);\nconsole.log(String(result));\n",
      "python": "import sys\n\n\ndef solve(s):\n    # Write your solution here\n    return 0\n\n\n# --- input handling: you don't need to change anything below ---\nlines = sys.stdin.read().split(\"\\n\")\ns = lines[0].rstrip(\"\\r\")\nresult = solve(s)\nprint(result)\n",
      "java": "import java.util.*;\n\npublic class Main {\n    static int solve(String s) {\n        // Write your solution here\n        return 0;\n    }\n\n    // --- input handling: you don't need to change anything below ---\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNextLine() ? sc.nextLine() : \"\";\n        int result = solve(s);\n        System.out.println(result);\n    }\n}\n",
      "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nint solve(const string& s) {\n    // Write your solution here\n    return 0;\n}\n\n// --- input handling: you don't need to change anything below ---\nint main() {\n    string s;\n    getline(cin, s);\n    if (!s.empty() && s.back() == '\\r') s.pop_back();\n    auto result = solve(s);\n    cout << result << endl;\n    return 0;\n}\n"
    }
  },
  {
    "title": "Trapping Rain Water",
    "slug": "trapping-rain-water",
    "difficulty": "hard",
    "tags": [
      "two-pointers",
      "array",
      "stack"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Goldman Sachs",
      "Microsoft"
    ],
    "description": "Given `n` non-negative integers representing an elevation map where each bar has width 1, compute how much water it can trap after raining.\n\nConstraints:\n- 1 <= n <= 2 * 10^4\n- 0 <= height[i] <= 10^5\n\nInput format (stdin): Line 1: n (length of the array). Line 2: the n integers.\nOutput format (stdout): A single integer.\nYou only need to complete the `solve` function; the input handling is already written for you.",
    "examples": [
      {
        "input": "nums = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]",
        "output": "6",
        "explanation": "6 units of water are trapped between the bars."
      },
      {
        "input": "nums = [4, 2, 0, 3, 2, 5]",
        "output": "9",
        "explanation": "9 units of water are trapped."
      }
    ],
    "testCases": [
      {
        "input": "12\n0 1 0 2 1 0 1 3 2 1 2 1\n",
        "expectedOutput": "6\n",
        "isHidden": false
      },
      {
        "input": "6\n4 2 0 3 2 5\n",
        "expectedOutput": "9\n",
        "isHidden": false
      },
      {
        "input": "1\n1\n",
        "expectedOutput": "0\n",
        "isHidden": false
      },
      {
        "input": "3\n3 0 3\n",
        "expectedOutput": "3\n",
        "isHidden": true
      },
      {
        "input": "15\n9 1 1 8 6 2 5 2 7 6 0 1 8 9 5\n",
        "expectedOutput": "61\n",
        "isHidden": true
      },
      {
        "input": "5\n5 4 3 2 1\n",
        "expectedOutput": "0\n",
        "isHidden": true
      }
    ],
    "hints": [
      "Water above a bar = min(maxLeft, maxRight) - height.",
      "Two pointers can track the left and right maxima without extra arrays."
    ],
    "solution": "Two pointers moving inward from the lower side, maintaining left/right maxima and accumulating the difference. O(n) time, O(1) space.",
    "starterCode": {
      "javascript": "function solve(nums) {\n  // Write your solution here\n  return 0;\n}\n\n// --- input handling: you don't need to change anything below ---\nconst lines = require(\"fs\").readFileSync(0, \"utf8\").split(\"\\n\");\nconst nums = (lines[1] || \"\").trim() ? lines[1].trim().split(/\\s+/).map(Number) : [];\nconst result = solve(nums);\nconsole.log(String(result));\n",
      "python": "import sys\n\n\ndef solve(nums):\n    # Write your solution here\n    return 0\n\n\n# --- input handling: you don't need to change anything below ---\nlines = sys.stdin.read().split(\"\\n\")\nnums = list(map(int, lines[1].split())) if len(lines) > 1 else []\nresult = solve(nums)\nprint(result)\n",
      "java": "import java.util.*;\n\npublic class Main {\n    static int solve(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n\n    // --- input handling: you don't need to change anything below ---\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        int result = solve(nums);\n        System.out.println(result);\n    }\n}\n",
      "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nint solve(vector<int>& nums) {\n    // Write your solution here\n    return 0;\n}\n\n// --- input handling: you don't need to change anything below ---\nint main() {\n    int n;\n    cin >> n;\n    vector<int> nums(n);\n    for (auto& x : nums) cin >> x;\n    auto result = solve(nums);\n    cout << result << endl;\n    return 0;\n}\n"
    }
  },
  {
    "title": "House Robber",
    "slug": "house-robber",
    "difficulty": "medium",
    "tags": [
      "dynamic-programming",
      "array"
    ],
    "companies": [
      "Amazon",
      "Microsoft",
      "Cisco"
    ],
    "description": "You are planning to rob houses along a street. Each house holds `nums[i]` money, but robbing two adjacent houses triggers the alarm.\n\nReturn the maximum amount you can rob without alerting the police.\n\nConstraints:\n- 1 <= nums.length <= 100\n- 0 <= nums[i] <= 400\n\nInput format (stdin): Line 1: n (length of the array). Line 2: the n integers.\nOutput format (stdout): A single integer.\nYou only need to complete the `solve` function; the input handling is already written for you.",
    "examples": [
      {
        "input": "nums = [1, 2, 3, 1]",
        "output": "4",
        "explanation": "Rob houses 1 and 3: 1 + 3 = 4."
      },
      {
        "input": "nums = [2, 7, 9, 3, 1]",
        "output": "12",
        "explanation": "Rob houses 1, 3 and 5: 2 + 9 + 1 = 12."
      }
    ],
    "testCases": [
      {
        "input": "4\n1 2 3 1\n",
        "expectedOutput": "4\n",
        "isHidden": false
      },
      {
        "input": "5\n2 7 9 3 1\n",
        "expectedOutput": "12\n",
        "isHidden": false
      },
      {
        "input": "1\n5\n",
        "expectedOutput": "5\n",
        "isHidden": false
      },
      {
        "input": "4\n2 1 1 2\n",
        "expectedOutput": "4\n",
        "isHidden": true
      },
      {
        "input": "12\n21 22 38 31 37 29 4 5 17 30 4 3\n",
        "expectedOutput": "134\n",
        "isHidden": true
      },
      {
        "input": "7\n10 1 1 10 1 1 10\n",
        "expectedOutput": "30\n",
        "isHidden": true
      }
    ],
    "hints": [
      "For each house: take it (plus best from two houses back) or skip it.",
      "You only need the previous two results."
    ],
    "solution": "dp[i] = max(dp[i-1], dp[i-2] + nums[i]) with two rolling variables. O(n) time, O(1) space.",
    "starterCode": {
      "javascript": "function solve(nums) {\n  // Write your solution here\n  return 0;\n}\n\n// --- input handling: you don't need to change anything below ---\nconst lines = require(\"fs\").readFileSync(0, \"utf8\").split(\"\\n\");\nconst nums = (lines[1] || \"\").trim() ? lines[1].trim().split(/\\s+/).map(Number) : [];\nconst result = solve(nums);\nconsole.log(String(result));\n",
      "python": "import sys\n\n\ndef solve(nums):\n    # Write your solution here\n    return 0\n\n\n# --- input handling: you don't need to change anything below ---\nlines = sys.stdin.read().split(\"\\n\")\nnums = list(map(int, lines[1].split())) if len(lines) > 1 else []\nresult = solve(nums)\nprint(result)\n",
      "java": "import java.util.*;\n\npublic class Main {\n    static int solve(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n\n    // --- input handling: you don't need to change anything below ---\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        int result = solve(nums);\n        System.out.println(result);\n    }\n}\n",
      "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nint solve(vector<int>& nums) {\n    // Write your solution here\n    return 0;\n}\n\n// --- input handling: you don't need to change anything below ---\nint main() {\n    int n;\n    cin >> n;\n    vector<int> nums(n);\n    for (auto& x : nums) cin >> x;\n    auto result = solve(nums);\n    cout << result << endl;\n    return 0;\n}\n"
    }
  },
  {
    "title": "Valid Palindrome",
    "slug": "valid-palindrome",
    "difficulty": "easy",
    "tags": [
      "two-pointers",
      "string"
    ],
    "companies": [
      "Meta",
      "Microsoft",
      "Amazon"
    ],
    "description": "A phrase is a palindrome if, after lower-casing it and removing every non-alphanumeric character, it reads the same forwards and backwards.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.\n\nConstraints:\n- 1 <= s.length <= 2 * 10^5\n- s consists of printable ASCII characters\n\nInput format (stdin): A single line containing the string.\nOutput format (stdout): `true` or `false`.\nYou only need to complete the `solve` function; the input handling is already written for you.",
    "examples": [
      {
        "input": "s = \"A man, a plan, a canal: Panama\"",
        "output": "true",
        "explanation": "After cleaning: \"amanaplanacanalpanama\" reads the same both ways."
      },
      {
        "input": "s = \"race a car\"",
        "output": "false",
        "explanation": "\"raceacar\" is not a palindrome."
      }
    ],
    "testCases": [
      {
        "input": "A man, a plan, a canal: Panama\n",
        "expectedOutput": "true\n",
        "isHidden": false
      },
      {
        "input": "race a car\n",
        "expectedOutput": "false\n",
        "isHidden": false
      },
      {
        "input": " \n",
        "expectedOutput": "true\n",
        "isHidden": false
      },
      {
        "input": "No lemon, no melon\n",
        "expectedOutput": "true\n",
        "isHidden": true
      },
      {
        "input": "0P\n",
        "expectedOutput": "false\n",
        "isHidden": true
      },
      {
        "input": "ab_a\n",
        "expectedOutput": "true\n",
        "isHidden": true
      }
    ],
    "hints": [
      "Use two pointers that skip non-alphanumeric characters.",
      "Compare characters case-insensitively."
    ],
    "solution": "Two pointers from both ends, skipping non-alphanumerics and comparing lower-cased characters. O(n) time, O(1) space.",
    "starterCode": {
      "javascript": "function solve(s) {\n  // Write your solution here\n  return false;\n}\n\n// --- input handling: you don't need to change anything below ---\nconst lines = require(\"fs\").readFileSync(0, \"utf8\").split(\"\\n\");\nconst s = (lines[0] || \"\").replace(/\\r$/, \"\");\nconst result = solve(s);\nconsole.log(String(result));\n",
      "python": "import sys\n\n\ndef solve(s):\n    # Write your solution here\n    return False\n\n\n# --- input handling: you don't need to change anything below ---\nlines = sys.stdin.read().split(\"\\n\")\ns = lines[0].rstrip(\"\\r\")\nresult = solve(s)\nprint(str(result).lower())\n",
      "java": "import java.util.*;\n\npublic class Main {\n    static boolean solve(String s) {\n        // Write your solution here\n        return false;\n    }\n\n    // --- input handling: you don't need to change anything below ---\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNextLine() ? sc.nextLine() : \"\";\n        boolean result = solve(s);\n        System.out.println(result);\n    }\n}\n",
      "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nbool solve(const string& s) {\n    // Write your solution here\n    return false;\n}\n\n// --- input handling: you don't need to change anything below ---\nint main() {\n    string s;\n    getline(cin, s);\n    if (!s.empty() && s.back() == '\\r') s.pop_back();\n    auto result = solve(s);\n    cout << (result ? \"true\" : \"false\") << endl;\n    return 0;\n}\n"
    }
  },
  {
    "title": "Container With Most Water",
    "slug": "container-with-most-water",
    "difficulty": "medium",
    "tags": [
      "two-pointers",
      "array",
      "greedy"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Goldman Sachs",
      "Adobe"
    ],
    "description": "You are given an array `height` of `n` vertical lines, where line `i` has height `height[i]` and sits at x = `i`.\n\nPick two lines that, together with the x-axis, hold the most water, and return that maximum area.\n\nConstraints:\n- 2 <= n <= 10^5\n- 0 <= height[i] <= 10^4\n\nInput format (stdin): Line 1: n (length of the array). Line 2: the n integers.\nOutput format (stdout): A single integer.\nYou only need to complete the `solve` function; the input handling is already written for you.",
    "examples": [
      {
        "input": "nums = [1, 8, 6, 2, 5, 4, 8, 3, 7]",
        "output": "49",
        "explanation": "Lines 1 and 8 give an area of 7 x 7 = 49."
      },
      {
        "input": "nums = [1, 1]",
        "output": "1",
        "explanation": "Two lines of height 1 with distance 1: area 1."
      }
    ],
    "testCases": [
      {
        "input": "9\n1 8 6 2 5 4 8 3 7\n",
        "expectedOutput": "49\n",
        "isHidden": false
      },
      {
        "input": "2\n1 1\n",
        "expectedOutput": "1\n",
        "isHidden": false
      },
      {
        "input": "5\n4 3 2 1 4\n",
        "expectedOutput": "16\n",
        "isHidden": false
      },
      {
        "input": "3\n1 2 1\n",
        "expectedOutput": "2\n",
        "isHidden": true
      },
      {
        "input": "14\n24 23 10 21 19 22 27 15 10 23 13 29 22 12\n",
        "expectedOutput": "264\n",
        "isHidden": true
      },
      {
        "input": "7\n2 3 4 5 18 17 6\n",
        "expectedOutput": "17\n",
        "isHidden": true
      }
    ],
    "hints": [
      "Area = min(h[l], h[r]) * (r - l).",
      "Move the pointer at the shorter line. Moving the taller one can never help."
    ],
    "solution": "Two pointers from both ends; always advance the shorter side. O(n) time, O(1) space.",
    "starterCode": {
      "javascript": "function solve(nums) {\n  // Write your solution here\n  return 0;\n}\n\n// --- input handling: you don't need to change anything below ---\nconst lines = require(\"fs\").readFileSync(0, \"utf8\").split(\"\\n\");\nconst nums = (lines[1] || \"\").trim() ? lines[1].trim().split(/\\s+/).map(Number) : [];\nconst result = solve(nums);\nconsole.log(String(result));\n",
      "python": "import sys\n\n\ndef solve(nums):\n    # Write your solution here\n    return 0\n\n\n# --- input handling: you don't need to change anything below ---\nlines = sys.stdin.read().split(\"\\n\")\nnums = list(map(int, lines[1].split())) if len(lines) > 1 else []\nresult = solve(nums)\nprint(result)\n",
      "java": "import java.util.*;\n\npublic class Main {\n    static int solve(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n\n    // --- input handling: you don't need to change anything below ---\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        int result = solve(nums);\n        System.out.println(result);\n    }\n}\n",
      "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nint solve(vector<int>& nums) {\n    // Write your solution here\n    return 0;\n}\n\n// --- input handling: you don't need to change anything below ---\nint main() {\n    int n;\n    cin >> n;\n    vector<int> nums(n);\n    for (auto& x : nums) cin >> x;\n    auto result = solve(nums);\n    cout << result << endl;\n    return 0;\n}\n"
    }
  }
]
